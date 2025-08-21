// @ts-ignore
import { ZstdCodec } from "zstd-codec";

export interface ZstdInstance {
	Simple: any;
	Streaming: any;
	Dict: {
		Compression: any;
		Decompression: any;
	};
}

let zstdInstance: ZstdInstance | undefined = undefined;
// simple 和 dict 必须来自同一个 zstd 实例，故需要同时持久化
let zstdSimpleInstance: any = undefined;
const zstdDictInstances: Record<string | number, any> = {};

function getZstdInstance(): Promise<ZstdInstance> {
	return new Promise((resolve, reject) => {
		if (!zstdInstance) {
			ZstdCodec.run((zstd: ZstdInstance) => {
				zstdInstance = zstd;
				resolve(zstd);
			});
		} else {
			resolve(zstdInstance);
		}
	});
}

async function getZstdSimpleInstance(): Promise<any> {
	const zstd = await getZstdInstance();

	if (!zstdSimpleInstance) {
		zstdSimpleInstance = new zstd.Simple();
	}

	return zstdSimpleInstance;
}

async function getZstdDictInstance(
	dictId: string | number,
	dictData: Uint8Array,
): Promise<any> {
	if (zstdDictInstances[dictId]) {
		return zstdDictInstances[dictId];
	}

	const zstd = await getZstdInstance();
	const zstdDictInstance = new zstd.Dict.Decompression(dictData);

	zstdDictInstances[dictId] = zstdDictInstance;

	return zstdDictInstance;
}

function reinitZstdInstance(): Promise<ZstdInstance> {
	zstdInstance = undefined;
	return getZstdInstance();
}

/**
 * 自将 Simple 实例和 Dict 实例持久化后，再没有遇到 OOM 错误
 */
async function zstdDecompressWithDict(
	compressedData: Uint8Array,
	dict: { id: string | number; data: Uint8Array },
	{ maxRetries }: { maxRetries: number } = { maxRetries: 1 },
): Promise<Uint8Array | null> {
	let retries = 0;

	while (retries <= maxRetries) {
		try {
			const zstdSimpleInstance = await getZstdSimpleInstance();
			const zstdDictInstance = await getZstdDictInstance(dict.id, dict.data);

			const decompressedData = zstdSimpleInstance.decompressUsingDict(
				compressedData,
				zstdDictInstance,
			) as Uint8Array | null;

			return decompressedData;
		} catch (error) {
			if (typeof error === "string" && error.startsWith("abort(OOM).")) {
				await reinitZstdInstance();

				retries++;

				if (retries > maxRetries) {
					throw error;
				}
			} else {
				throw error;
			}
		}
	}

	throw Error("Zstd decompression failed");
}

export { getZstdInstance, zstdDecompressWithDict };
