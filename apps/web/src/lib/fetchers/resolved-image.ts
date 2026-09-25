import { queryOptions, skipToken } from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter";

export function ResolvedImageQueryOptions(uri?: string) {
	return queryOptions({
		queryKey: ["resolved-image", uri],
		// A mounted image also observes its cached preview, keeping its URL alive.
		gcTime: 0,
		queryFn: uri
			? async ({ client, queryKey, signal }) => {
					const adapter = getDataAdapter();
					const referenceId = crypto.randomUUID();
					const {
						data: { src },
					} = await adapter.resolveMessageFile({ uri, referenceId });
					const release = () => {
						void adapter.releaseMessageFile({ referenceId }).catch(() => {});
					};
					const image = new Image();
					try {
						signal.throwIfAborted();
						image.src = src;
						await image.decode();
						signal.throwIfAborted();
					} catch (error) {
						release();
						throw error;
					}

					// The query owns the adapter reference, including while used as a preview.
					const cache = client.getQueryCache();
					const query = cache.find({ queryKey });
					const unsubscribe = cache.subscribe((event) => {
						if (event.type === "removed" && event.query === query) {
							unsubscribe();
							release();
						}
					});
					return {
						src,
						width: image.naturalWidth,
						height: image.naturalHeight,
					};
				}
			: skipToken,
	});
}
