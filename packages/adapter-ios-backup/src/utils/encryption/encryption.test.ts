import { createCipheriv } from "node:crypto";
import { buildBinaryPlist, parsePlistDictionary, PlistUid } from "rork-plist";
import { afterEach, expect, test } from "vitest";
import { BackupEncryption, parseFileMetadata } from "./encryption";
import { BackupKeybag } from "./keybag";
import fixture from "./test/fixture.json";

const bytes = (value: string) => new Uint8Array(Buffer.from(value, "base64"));
const file = (value: string, name = "fixture") =>
	new File([bytes(value)], name);
const sessions: BackupEncryption[] = [];

async function open(
	format:
		| "manifestBinary"
		| "manifestXml"
		| "manifestLegacy" = "manifestBinary",
) {
	const session = await BackupEncryption.open(
		file(fixture[format]),
		fixture.password,
	);
	expect(session).toBeDefined();
	sessions.push(session!);
	return session!;
}

afterEach(() => {
	for (const session of sessions.splice(0)) session.dispose();
});

test.each(["manifestXml", "manifestBinary"] as const)(
	"decrypts independent Python/OpenSSL %s fixture and preserves plaintext ending in padding-like bytes",
	async (format) => {
		const session = await open(format);
		const result = await session.decrypt(
			file(fixture.fileEncrypted),
			bytes(fixture.fileMetadata),
		);
		expect(new Uint8Array(await result.arrayBuffer())).toEqual(
			bytes(fixture.filePlain),
		);
		expect(result.size).toBe(251);
	},
);

test("reads a plaintext manifest with a legacy keybag while keeping file decryption active", async () => {
	const session = await open("manifestLegacy");
	expect(await session.decryptManifest(file(fixture.manifestPlain))).toEqual(
		bytes(fixture.manifestPlain),
	);
	const result = await session.decrypt(
		file(fixture.fileEncrypted),
		bytes(fixture.fileMetadata),
	);
	expect(new Uint8Array(await result.arrayBuffer())).toEqual(
		bytes(fixture.filePlain),
	);
	await expect(
		session.decryptManifest(file(fixture.manifestEncrypted)),
	).rejects.toMatchObject({ name: "InvalidBackupError" });
});

test("unwraps the reference-compatible WRAP=3 class key", async () => {
	const manifest = parsePlistDictionary(bytes(fixture.manifestBinary));
	const keybag = new Uint8Array(manifest.BackupKeyBag as Uint8Array);
	const view = new DataView(keybag.buffer);
	for (let offset = 0; offset < keybag.length; ) {
		const tag = new TextDecoder().decode(keybag.subarray(offset, offset + 4));
		const length = view.getUint32(offset + 4, false);
		if (tag === "WRAP") view.setUint32(offset + 8, 3, false);
		offset += length + 8;
	}
	const unlocked = await BackupKeybag.unlock(keybag, fixture.password);
	try {
		expect(
			await unlocked.unwrap(
				parseFileMetadata(bytes(fixture.fileMetadata)).encryptionKey!,
			),
		).toEqual(bytes(fixture.fileKey));
	} finally {
		unlocked.dispose();
	}
});

test.each(["manifestEncrypted", "manifestUnpadded"] as const)(
	"decrypts %s to the independent SQLite fixture",
	async (manifestKind) => {
		const session = await open();
		expect(await session.decryptManifest(file(fixture[manifestKind]))).toEqual(
			bytes(fixture.manifestPlain),
		);
	},
);

function metadata(
	size: number,
	key = (
		parsePlistDictionary(bytes(fixture.fileMetadata))
			.$objects as unknown as Array<Record<string, unknown>>
	)[3]["NS.data"] as Uint8Array,
) {
	return new Uint8Array(
		buildBinaryPlist({
			$archiver: "NSKeyedArchiver",
			$version: 100000,
			$top: { root: new PlistUid(1) },
			$objects: [
				"$null",
				{ Size: size, ProtectionClass: 4, EncryptionKey: new PlistUid(2) },
				{ "NS.data": key },
			],
		}),
	);
}

function encrypt(plain: Uint8Array, padding = false) {
	const cipher = createCipheriv(
		"aes-256-cbc",
		bytes(fixture.fileKey),
		new Uint8Array(16),
	);
	cipher.setAutoPadding(padding);
	return new Uint8Array(Buffer.concat([cipher.update(plain), cipher.final()]));
}

test("decrypts across chunk boundaries with raw CBC, retaining exact logical length", async () => {
	const session = await open();
	const plain = new Uint8Array(2 * 1024 * 1024 + 32);
	for (let i = 0; i < plain.length; i++) plain[i] = i % 251;
	const logicalSize = plain.length - 7;
	const encrypted = new File([encrypt(plain)], "large");
	const decrypted = await session.decrypt(encrypted, metadata(logicalSize));
	expect(new Uint8Array(await decrypted.arrayBuffer())).toEqual(
		plain.slice(0, logicalSize),
	);
});

test("falls back to metadata length only when PKCS#7 padding is invalid", async () => {
	const session = await open();
	const plain = new Uint8Array(64).fill(5);
	plain[61] = 4; // A valid last-byte length alone is not valid PKCS#7 padding.
	const encrypted = new File([encrypt(plain)], "aligned");
	expect(
		new Uint8Array(
			await (await session.decrypt(encrypted, metadata(64))).arrayBuffer(),
		),
	).toEqual(plain);
	expect((await session.decrypt(encrypted, metadata(16))).size).toBe(16);
});

test.each([240, 300])(
	"uses validated padding instead of stale metadata size %i",
	async (size) => {
		const session = await open();
		const result = await session.decrypt(
			file(fixture.fileEncrypted),
			metadata(size),
		);
		expect(new Uint8Array(await result.arrayBuffer())).toEqual(
			bytes(fixture.filePlain),
		);
	},
);

test.each([1024 * 1024, 2 * 1024 * 1024 + 7])(
	"decrypts all %i bytes across chunk boundaries despite a smaller metadata size",
	async (size) => {
		const session = await open();
		const plain = Uint8Array.from({ length: size }, (_, index) => index % 251);
		const result = await session.decrypt(
			new File([encrypt(plain, true)], "large-padded"),
			metadata(240),
		);
		expect(result.size).toBe(plain.length);
		expect(Buffer.from(await result.arrayBuffer()).equals(plain)).toBe(true);
	},
);

test("removes a full padding block from an encrypted empty file", async () => {
	const session = await open();
	const result = await session.decrypt(
		new File([encrypt(new Uint8Array(), true)], "empty-padded"),
		metadata(16),
	);
	expect(result.size).toBe(0);
});
