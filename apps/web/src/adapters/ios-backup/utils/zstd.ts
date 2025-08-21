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

function reinitZstdInstance(): Promise<ZstdInstance> {
	zstdInstance = undefined;
	return getZstdInstance();
}

async function zstdDecompressWithDict(
	compressedData: Uint8Array,
	dictData: Uint8Array,
	{ maxRetries }: { maxRetries: number } = { maxRetries: 3 },
): Promise<Uint8Array | null> {
	let retries = 0;

	while (retries <= maxRetries) {
		try {
			const zstd = await getZstdInstance();
			const zstdSimple = new zstd.Simple();
			const zstdDict = new zstd.Dict.Decompression(dictData);

			const decompressedData = zstdSimple.decompressUsingDict(
				compressedData,
				zstdDict,
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
