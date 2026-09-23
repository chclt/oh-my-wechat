import CryptoJS from "crypto-js";
import {
	isPlistDictionary,
	parsePlistDictionary,
	PlistUid,
	type PlistValue,
} from "rork-plist";
import { createBackupError, createInvalidBackupError } from "../../errors.ts";
import { BackupKeybag } from "./keybag.ts";

const MAX_PLIST_BYTES = 16 * 1024 * 1024;
const CHUNK_BYTES = 1024 * 1024;

function parseBackupPlist(bytes: Uint8Array) {
	if (bytes.length > MAX_PLIST_BYTES)
		throw createInvalidBackupError("Backup metadata exceeds the size limit");
	try {
		return parsePlistDictionary(bytes, { maxDepth: 64 });
	} catch {
		throw createInvalidBackupError("Invalid backup property list");
	}
}

function readPlistData(value: PlistValue | undefined): Uint8Array {
	if (!(value instanceof Uint8Array))
		throw createInvalidBackupError("Missing or invalid encryption key data");
	return value;
}

/** Resolve only the MBFile fields we need, without expanding the archive graph. */
export function parseFileMetadata(bytes: Uint8Array) {
	const archive = parseBackupPlist(bytes);
	const objects = archive.$objects;
	if (
		archive.$archiver !== "NSKeyedArchiver" ||
		!Array.isArray(objects) ||
		!isPlistDictionary(archive.$top)
	) {
		throw createInvalidBackupError(
			"File metadata is not a valid NSKeyedArchiver archive",
		);
	}
	const resolve = (value: PlistValue | undefined): PlistValue | undefined => {
		const visited = new Set<number>();
		while (value instanceof PlistUid) {
			if (visited.has(value.uid) || value.uid >= objects.length)
				throw createInvalidBackupError(
					"Invalid object reference in file metadata",
				);
			visited.add(value.uid);
			value = objects[value.uid];
		}
		return value;
	};
	const root = resolve(archive.$top.root);
	if (!isPlistDictionary(root))
		throw createInvalidBackupError("Missing file metadata root object");
	const sizeValue = resolve(root.Size);
	const size = typeof sizeValue === "bigint" ? Number(sizeValue) : sizeValue;
	if (typeof size !== "number" || !Number.isSafeInteger(size) || size < 0)
		throw createInvalidBackupError("Invalid file size in metadata");
	let encryptionKey = resolve(root.EncryptionKey);
	if (isPlistDictionary(encryptionKey))
		encryptionKey = resolve(encryptionKey["NS.data"]);
	if (encryptionKey === undefined || encryptionKey === "$null") {
		if (size !== 0)
			throw createInvalidBackupError(
				"Missing encryption key for a nonempty file",
			);
		return { size, encryptionKey: undefined };
	}
	const key = readPlistData(encryptionKey);
	if (key.length !== 44)
		throw createInvalidBackupError("Invalid file encryption key length");
	const protectionClass = resolve(root.ProtectionClass);
	const embeddedClass = new DataView(key.buffer, key.byteOffset, 4).getUint32(
		0,
		true,
	);
	if (
		protectionClass !== undefined &&
		Number(protectionClass) !== embeddedClass
	)
		throw createInvalidBackupError(
			"File key protection class does not match metadata",
		);
	return { size, encryptionKey: key };
}

function wordArrayToBytes(
	value: CryptoJS.lib.WordArray,
): Uint8Array<ArrayBuffer> {
	const bytes = new Uint8Array(value.sigBytes);
	for (let i = 0; i < bytes.length; i++)
		bytes[i] = (value.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 255;
	value.words.fill(0);
	return bytes;
}

/** Prefer validated PKCS#7 padding; use MBFile.Size for unpadded files. */
async function decryptFile(
	file: File,
	key: Uint8Array,
	size?: number,
	signal?: AbortSignal,
): Promise<File> {
	if (file.size % 16 !== 0)
		throw createInvalidBackupError(
			"Encrypted file length is not AES block aligned",
		);
	const parts: BlobPart[] = [];
	const keyWords = CryptoJS.lib.WordArray.create(key);
	let iv = new Uint8Array(16);
	let outputSize = size ?? file.size;
	try {
		for (let offset = 0; offset < file.size; offset += CHUNK_BYTES) {
			signal?.throwIfAborted();
			const end = Math.min(offset + CHUNK_BYTES, file.size);
			const ciphertext = new Uint8Array(
				await file.slice(offset, end).arrayBuffer(),
			);
			signal?.throwIfAborted();
			if (size !== undefined && end === file.size) {
				const cryptoKey = await crypto.subtle.importKey(
					"raw",
					new Uint8Array(key),
					"AES-CBC",
					false,
					["decrypt"],
				);
				try {
					// Web Crypto validates every padding byte before removing it.
					const plaintext = await crypto.subtle.decrypt(
						{ name: "AES-CBC", iv },
						cryptoKey,
						ciphertext,
					);
					outputSize = offset + plaintext.byteLength;
					parts.push(plaintext);
					continue;
				} catch (error) {
					if (
						!(error instanceof DOMException) ||
						error.name !== "OperationError"
					)
						throw error;
					// Some backups store raw CBC without PKCS#7 padding.
				}
			}
			const plaintext = wordArrayToBytes(
				CryptoJS.AES.decrypt(
					CryptoJS.lib.CipherParams.create({
						ciphertext: CryptoJS.lib.WordArray.create(ciphertext),
					}),
					keyWords,
					{
						iv: CryptoJS.lib.WordArray.create(iv),
						mode: CryptoJS.mode.CBC,
						padding: CryptoJS.pad.NoPadding,
					},
				),
			);
			iv = ciphertext.slice(-16);
			parts.push(plaintext);
		}
		signal?.throwIfAborted();
		if (outputSize > file.size)
			throw createInvalidBackupError(
				"Encrypted file is shorter than the declared plaintext size",
			);
		return new File([new Blob(parts).slice(0, outputSize)], file.name, {
			type: file.type,
			lastModified: file.lastModified,
		});
	} finally {
		keyWords.words.fill(0);
	}
}

export class BackupEncryption {
	private readonly lifetime = new AbortController();
	private constructor(
		private readonly keybag: BackupKeybag,
		private readonly manifestKey: Uint8Array | undefined,
	) {}

	static async open(
		manifest: File,
		password?: string,
		signal?: AbortSignal,
	): Promise<BackupEncryption | undefined> {
		if (manifest.size > MAX_PLIST_BYTES)
			throw createInvalidBackupError("Manifest.plist exceeds the size limit");
		const info = parseBackupPlist(new Uint8Array(await manifest.arrayBuffer()));
		if (info.IsEncrypted === false) return undefined;
		if (info.IsEncrypted !== true)
			throw createInvalidBackupError(
				"Missing or invalid IsEncrypted flag in Manifest.plist",
			);
		if (password === undefined)
			throw createBackupError(
				"BackupPasswordRequiredError",
				"Backup password is required",
			);
		const keybagBytes = readPlistData(info.BackupKeyBag);
		// iOSbackup.getManifestDB reads a plaintext manifest in older backups.
		// Detect the missing key, not a guessed iOS version; see README.md.
		const manifestKey =
			info.ManifestKey === undefined
				? undefined
				: readPlistData(info.ManifestKey);
		if (manifestKey !== undefined && manifestKey.length !== 44)
			throw createInvalidBackupError("Invalid ManifestKey length");
		const keybag = await BackupKeybag.unlock(keybagBytes, password, signal);
		return new BackupEncryption(keybag, manifestKey);
	}

	async decryptManifest(
		file: File,
		signal?: AbortSignal,
	): Promise<Uint8Array<ArrayBuffer>> {
		this.lifetime.signal.throwIfAborted();
		signal?.throwIfAborted();
		const key = this.manifestKey
			? await this.keybag.unwrap(this.manifestKey)
			: undefined;
		try {
			const decrypted = key
				? await decryptFile(
						file,
						key,
						undefined,
						signal ?? this.lifetime.signal,
					)
				: file;
			const bytes = new Uint8Array(await decrypted.arrayBuffer());
			this.lifetime.signal.throwIfAborted();
			signal?.throwIfAborted();
			if (
				bytes.length < 100 ||
				new TextDecoder().decode(bytes.subarray(0, 16)) !== "SQLite format 3\0"
			)
				throw createInvalidBackupError("Manifest.db is not a SQLite database");
			const encodedPageSize = new DataView(bytes.buffer).getUint16(16, false);
			const pageSize = encodedPageSize === 1 ? 65536 : encodedPageSize;
			if (
				pageSize < 512 ||
				pageSize > 65536 ||
				(pageSize & (pageSize - 1)) !== 0
			)
				throw createInvalidBackupError("Invalid Manifest.db page size");
			const tail = bytes.length % pageSize;
			if (
				tail !== 0 &&
				(!key ||
					tail !== 16 ||
					!bytes.subarray(-16).every((byte) => byte === 16))
			)
				throw createInvalidBackupError(
					"Manifest.db is truncated or has invalid padding",
				);
			return tail ? bytes.slice(0, -tail) : bytes;
		} finally {
			key?.fill(0);
		}
	}

	async decrypt(file: File, metadata: Uint8Array): Promise<File> {
		this.lifetime.signal.throwIfAborted();
		const { size, encryptionKey } = parseFileMetadata(metadata);
		if (!encryptionKey) {
			if (file.size !== 0)
				throw createInvalidBackupError(
					"Empty file metadata does not match stored content",
				);
			return file;
		}
		const key = await this.keybag.unwrap(encryptionKey);
		try {
			return await decryptFile(file, key, size, this.lifetime.signal);
		} finally {
			key.fill(0);
		}
	}

	dispose() {
		this.lifetime.abort();
		this.keybag.dispose();
	}
}
