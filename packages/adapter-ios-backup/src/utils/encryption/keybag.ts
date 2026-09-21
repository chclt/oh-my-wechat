// iOS backup keybag format reference:
// https://github.com/jsharkey13/iphone_backup_decrypt
// Cryptographic primitives are provided by Web Crypto, not implemented here.

import { createBackupError, createInvalidBackupError } from "../../errors.ts";

type KeybagFields = Map<string, Uint8Array>;

function readKeybagNumber(fields: KeybagFields, tag: string): number {
	const bytes = fields.get(tag);
	if (bytes?.length !== 4)
		throw createInvalidBackupError(`Missing or invalid keybag field: ${tag}`);
	return new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, false);
}

function readKeybagSalt(
	fields: KeybagFields,
	tag: string,
): Uint8Array<ArrayBuffer> {
	const bytes = fields.get(tag);
	if (!bytes?.length || bytes.length > 1024) {
		throw createInvalidBackupError(`Missing or invalid keybag field: ${tag}`);
	}
	return new Uint8Array(bytes);
}

function readKeybagIterations(
	fields: KeybagFields,
	tag: string,
	max: number,
): number {
	const value = readKeybagNumber(fields, tag);
	if (value < 1 || value > max)
		throw createInvalidBackupError(
			`Keybag iteration count is out of range: ${tag}`,
		);
	return value;
}

function parseKeybag(bytes: Uint8Array) {
	const header: KeybagFields = new Map();
	const classes = new Map<number, KeybagFields>();
	let current = header;
	const saveClass = () => {
		if (current === header) return;
		const id = readKeybagNumber(current, "CLAS");
		if (classes.has(id))
			throw createInvalidBackupError(
				"Duplicate protection class in backup keybag",
			);
		classes.set(id, current);
	};
	for (let offset = 0; offset < bytes.length; ) {
		if (offset + 8 > bytes.length)
			throw createInvalidBackupError("Truncated backup keybag");
		const tag = new TextDecoder().decode(bytes.subarray(offset, offset + 4));
		const length = new DataView(
			bytes.buffer,
			bytes.byteOffset + offset + 4,
			4,
		).getUint32(0, false);
		offset += 8;
		if (length > bytes.length - offset)
			throw createInvalidBackupError("Truncated backup keybag");
		if (tag === "UUID" && header.has("UUID")) {
			saveClass();
			current = new Map();
		}
		if (current.has(tag))
			throw createInvalidBackupError(`Duplicate backup keybag field: ${tag}`);
		current.set(tag, bytes.subarray(offset, offset + length));
		offset += length;
	}
	saveClass();
	if (readKeybagNumber(header, "TYPE") !== 1) {
		throw createBackupError(
			"UnsupportedBackupError",
			"Only local Finder / iTunes backup keybags are supported",
		);
	}
	if (!classes.size)
		throw createInvalidBackupError("Backup keybag contains no class keys");
	return { header, classes };
}

async function derivePasswordKey(
	input: Uint8Array,
	salt: Uint8Array<ArrayBuffer>,
	count: number,
	hash: string,
) {
	const key = await crypto.subtle.importKey(
		"raw",
		new Uint8Array(input),
		"PBKDF2",
		false,
		["deriveBits"],
	);
	return new Uint8Array(
		await crypto.subtle.deriveBits(
			{ name: "PBKDF2", salt, iterations: count, hash },
			key,
			256,
		),
	);
}

/** Holds only non-extractable class keys; the password is never retained. */
export class BackupKeybag {
	private constructor(private readonly keys: Map<number, CryptoKey>) {}

	static async unlock(
		bytes: Uint8Array,
		password: string,
		signal?: AbortSignal,
	): Promise<BackupKeybag> {
		if (!globalThis.crypto?.subtle) {
			throw createBackupError(
				"UnsupportedBackupBrowserError",
				"Web Crypto is unavailable in this browser context",
			);
		}
		const { header, classes } = parseKeybag(bytes);
		const salt = readKeybagSalt(header, "SALT");
		const count = readKeybagIterations(header, "ITER", 1_000_000);
		const hasSecondStage = header.has("DPSL") || header.has("DPIC");
		const secondSalt = hasSecondStage
			? readKeybagSalt(header, "DPSL")
			: undefined;
		const secondCount = hasSecondStage
			? readKeybagIterations(header, "DPIC", 20_000_000)
			: undefined;
		// Validate structures before spending time deriving a key.
		for (const fields of classes.values()) {
			if (fields.has("WPKY") && fields.get("WPKY")!.length !== 40)
				throw createInvalidBackupError("Invalid wrapped class key length");
			readKeybagNumber(fields, "WRAP");
		}
		let secret = new TextEncoder().encode(password);
		const keys = new Map<number, CryptoKey>();
		try {
			signal?.throwIfAborted();
			if (secondSalt && secondCount) {
				const derived = await derivePasswordKey(
					secret,
					secondSalt,
					secondCount,
					"SHA-256",
				);
				secret.fill(0);
				secret = derived;
			}
			signal?.throwIfAborted();
			const derived = await derivePasswordKey(secret, salt, count, "SHA-1");
			secret.fill(0);
			secret = derived;
			const wrappingKey = await crypto.subtle.importKey(
				"raw",
				secret,
				"AES-KW",
				false,
				["unwrapKey"],
			);
			signal?.throwIfAborted();
			for (const [id, fields] of classes) {
				const wrap = readKeybagNumber(fields, "WRAP");
				const wrapped = fields.get("WPKY");
				// WRAP is a bitfield, as in iphone_backup_decrypt.unlockWithPassphrase.
				// Other flags do not bypass AES-KW integrity checks; see README.md.
				if (!wrapped || !(wrap & 2)) continue;
				try {
					keys.set(
						id,
						await crypto.subtle.unwrapKey(
							"raw",
							new Uint8Array(wrapped),
							wrappingKey,
							"AES-KW",
							"AES-KW",
							false,
							["unwrapKey"],
						),
					);
				} catch {
					throw createBackupError(
						"BackupPasswordError",
						"Incorrect backup password or damaged backup keybag",
					);
				}
			}
			signal?.throwIfAborted();
			if (!keys.size)
				throw createBackupError(
					"UnsupportedBackupError",
					"Backup keybag contains no password-wrapped class keys",
				);
			return new BackupKeybag(keys);
		} catch (error) {
			keys.clear();
			throw error;
		} finally {
			secret.fill(0);
		}
	}

	async unwrap(persistentKey: Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
		const protectionClass = new DataView(
			persistentKey.buffer,
			persistentKey.byteOffset,
			4,
		).getUint32(0, true);
		const key = this.keys.get(protectionClass);
		if (!key)
			throw createBackupError(
				"UnsupportedBackupError",
				`Unsupported or locked protection class: ${protectionClass}`,
			);
		try {
			const unwrapped = await crypto.subtle.unwrapKey(
				"raw",
				new Uint8Array(persistentKey.subarray(4)),
				key,
				"AES-KW",
				"AES-CBC",
				true,
				["decrypt"],
			);
			return new Uint8Array(await crypto.subtle.exportKey("raw", unwrapped));
		} catch {
			throw createInvalidBackupError(
				"Backup file key failed integrity verification",
			);
		}
	}

	dispose() {
		this.keys.clear();
	}
}
