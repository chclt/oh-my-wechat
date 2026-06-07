import type {
	ReleaseMessageFileRequest,
	ReleaseMessageFileResponse,
	ResolveMessageFileRequest,
	ResolveMessageFileResponse,
} from "@repo/types/adapter";
import { and, eq } from "drizzle-orm";
import { filesTable } from "../../database/_manifest.ts";
import { WCDatabases } from "../../types.ts";
import { MANIFEST_DOMAIN, URI_PREFIX } from "../../utils/constants.ts";
import { getFileFromDirectory } from "../../utils/index.ts";
import { convertWxgfToImage } from "../../utils/wxgf/index.ts";
import { isWxgf } from "../../utils/wxgf/utils.ts";

interface RegistryEntry {
	/** 解析完成后的 blob URL；仍在加载中时为 undefined。 */
	src: string | undefined;
	count: number;
	pending: Promise<string>;
}

const registry = new Map<string, RegistryEntry>();

async function createSrcFromFile(file: File): Promise<string> {
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
	}: {
		directory: FileSystemDirectoryHandle | FileList;
		databases: WCDatabases;
	},
): Promise<string> {
	const relativePath = uri.slice(URI_PREFIX.length);

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const rows = db
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
		throw new Error(`[image] file not found for uri: ${uri}`);
	}

	const file = await getFileFromDirectory(directory, [
		row.fileID.substring(0, 2),
		row.fileID,
	]);

	if (!file) {
		throw new Error(`[image] file handle not found for uri: ${uri}`);
	}

	return createSrcFromFile(file);
}

export type ResolveInput = [
	ResolveMessageFileRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];

export type ResolveOutput = ResolveMessageFileResponse;

export async function resolve(...input: ResolveInput): ResolveOutput {
	const [{ uri }, ctx] = input;
	if (!uri.startsWith(URI_PREFIX)) {
		throw new Error(`[image] unsupported uri: ${uri}`);
	}

	let entry = registry.get(uri);
	if (!entry) {
		// 在 entry 创建时就启动加载，让计数从第一个等待者起就生效，
		// 避免加载期间 release 因 entry 不存在而被忽略造成泄漏。
		entry = { src: undefined, count: 0, pending: loadSrc(uri, ctx) };
		registry.set(uri, entry);
	}

	entry.count += 1;

	if (entry.src !== undefined) {
		return { data: { src: entry.src } };
	}

	let src: string;
	try {
		src = await entry.pending;
	} catch (error) {
		// 加载失败：移除 entry 以便后续重试，并撤销本次占用的计数。
		entry.count -= 1;
		if (registry.get(uri) === entry) registry.delete(uri);
		throw error;
	}
	if (entry.src === undefined) entry.src = src;

	// 加载期间所有使用者都已 release，这里收尾时立即回收。
	if (entry.count <= 0 && registry.get(uri) === entry) {
		URL.revokeObjectURL(entry.src);
		registry.delete(uri);
	}

	return { data: { src } };
}

export type ReleaseInput = [
	ReleaseMessageFileRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];

export type ReleaseOutput = ReleaseMessageFileResponse;

export async function release(...input: ReleaseInput): ReleaseOutput {
	const [{ uri }] = input;
	const entry = registry.get(uri);
	if (!entry) return { data: undefined };

	entry.count -= 1;

	if (entry.count > 0) return { data: undefined };

	// src 还在加载中：保留 entry（count 已 ≤0），由 resolve 收尾时回收。
	if (entry.src !== undefined) {
		URL.revokeObjectURL(entry.src);
		registry.delete(uri);
	}

	return { data: undefined };
}
