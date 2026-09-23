import type { ImageInfo } from "@repo/types";
import type React from "react";
import Image from "@/components/image.tsx";
import { useAutoResolutionImage } from "@/hooks/use-auto-resolution-image";

export default function AutoResolutionFallbackImage({
	image,
	ref,
	...props
}: {
	image?: ImageInfo | null;
	ref?: React.Ref<HTMLImageElement>;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
	const { target, targetImage, isError } = useAutoResolutionImage(image);
	const dimensions = targetImage ?? target;

	return (
		<Image
			ref={ref}
			src={targetImage?.src}
			width={dimensions?.width}
			height={dimensions?.height}
			loading="lazy"
			data-state={isError ? "error" : undefined}
			{...props}
		/>
	);
}
