import type {
	ReleaseMessageFileRequest,
	ReleaseMessageFileResponse,
	ResolveMessageFileRequest,
	ResolveMessageFileResponse,
} from "@repo/types/adapter";
import { and, eq } from "drizzle-orm";
import { filesTable } from "../../database/_manifest.ts";
import type { WCDatabases } from "../../types.ts";
import { MANIFEST_DOMAIN, URI_PREFIX } from "../../utils/constants.ts";
import type { BackupEncryption } from "../../utils/encryption/encryption.ts";
import { readManifestFile } from "../../utils/index.ts";
import { ResourceRegistry } from "../../utils/resource-registry";
import { convertSilk } from "../../utils/silk";
import { convertNoteSpeex } from "../../utils/speex";
import { convertWxgfToImage } from "../../utils/wxgf/index.ts";
import { isWxgf } from "../../utils/wxgf/utils.ts";

const registry = new ResourceRegistry<string>((src) =>
	URL.revokeObjectURL(src),
);

export function clearFileRegistry() {
	registry.clear();
}

async function createSrcFromFile(
	file: File,
	relativePath: string,
): Promise<string> {
	if (relativePath.endsWith(".speex")) {
		const data = new Uint8Array(await file.arrayBuffer());
		return URL.createObjectURL(await convertNoteSpeex(data));
	}
	if (relativePath.endsWith(".aud")) {
		return convertSilk(await file.arrayBuffer());
	}
	const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
	if (isWxgf(header)) {
		const data = new Uint8Array(await file.arrayBuffer());
		return convertWxgfToImage(data);
	}
	return URL.createObjectURL(file);
}

async function loadSrc(
	uri: string,
	{
		directory,
		databases,
		encryption,
	}: {
		directory: FileSystemDirectoryHandle | FileList;
		databases: WCDatabases;
		encryption?: BackupEncryption;
	},
): Promise<string> {
	const relativePath = uri.slice(URI_PREFIX.length);

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const rows = await db
		.select()
		.from(filesTable)
		.where(
			and(
				eq(filesTable.domain, MANIFEST_DOMAIN),
				eq(filesTable.relativePath, relativePath),
				eq(filesTable.flags, 1),
			),
		)
		.all();

	const row = rows[0];
	if (!row || !row.fileID) {
		throw new Error(`[messageFile] file not found for uri: ${uri}`);
	}

	const file = await readManifestFile(directory, row, encryption);

	if (!file) {
		throw new Error(`[messageFile] file handle not found for uri: ${uri}`);
	}

	return createSrcFromFile(file, relativePath);
}

export type ResolveInput = [
	ResolveMessageFileRequest,
	{
		directory: FileSystemDirectoryHandle | FileList;
		databases: WCDatabases;
		encryption?: BackupEncryption;
	},
];

export type ResolveOutput = ResolveMessageFileResponse;

export async function resolve(...input: ResolveInput): ResolveOutput {
	const [{ uri, referenceId }, ctx] = input;
	if (!uri.startsWith(URI_PREFIX)) {
		throw new Error(`[messageFile] unsupported uri: ${uri}`);
	}

	return {
		data: {
			src: await registry.acquire(uri, referenceId, () => loadSrc(uri, ctx)),
		},
	};
}

export type ReleaseInput = [ReleaseMessageFileRequest];

export type ReleaseOutput = ReleaseMessageFileResponse;

export async function release(...input: ReleaseInput): ReleaseOutput {
	const [{ referenceId }] = input;
	registry.release(referenceId);
	return { data: undefined };
}
