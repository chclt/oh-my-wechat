import type { ImageInfo } from "@repo/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ResolvedImageQueryOptions } from "@/lib/fetchers/resolved-image";

export type ImageResolution = "hd" | "regular" | "thumbnail";

const defaultResolutionOrder: readonly ImageResolution[] = [
	"hd",
	"regular",
	"thumbnail",
];

export function useAutoResolutionImage(
	image: ImageInfo | null | undefined,
	{
		resolutionOrder = defaultResolutionOrder,
		enabled = true,
	}: {
		resolutionOrder?: readonly ImageResolution[];
		enabled?: boolean;
	} = {},
) {
	const candidates = resolutionOrder.flatMap((resolution) => {
		const file = image?.[resolution];
		return file ? [file] : [];
	});
	// Observe all candidates for cached previews and errors; only load the target.
	const results = useQueries({
		queries: candidates.map((file) => ({
			...ResolvedImageQueryOptions(file.uri),
			enabled: false,
		})),
	});
	const targetIndex = results.findIndex(({ status }) => status !== "error");
	useQuery({
		...ResolvedImageQueryOptions(candidates[targetIndex]?.uri),
		enabled,
	});
	const displayedIndex = results.findIndex(
		({ status }) => status === "success",
	);
	const target = candidates[targetIndex];
	// Other versions provide a ratio reference, not the target's pixel dimensions.
	const ratioDimensions =
		target &&
		(target === image?.thumbnail
			? [target]
			: [target, image?.regular, image?.hd, image?.thumbnail]
		)
			.map((file) => {
				const index = candidates.findIndex((candidate) => candidate === file);
				return results[index]?.data ?? file;
			})
			.find((dimensions) => dimensions?.width && dimensions.height);

	return {
		target,
		targetImage: results[targetIndex]?.data,
		ratioDimensions,
		displayedImage: results[displayedIndex]?.data,
		isError: candidates.length > 0 && targetIndex === -1,
	};
}
