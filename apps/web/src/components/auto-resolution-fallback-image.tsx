import type { ImageInfo } from "@repo/types";
import React, { useEffect, useState } from "react";
import Image from "@/components/image.tsx";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";

const resolutionOrder: (keyof ImageInfo)[] = ["hd", "regular", "thumbnail"];

export default function AutoResolutionFallbackImage({
	image,
	ref,
	...props
}: {
	image?: ImageInfo | null;
	ref?: React.Ref<HTMLImageElement>;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
	const [displayResolutionIndex, setDisplayResolutionIndex] = useState(-1);

	useEffect(() => {
		if (!image) {
			setDisplayResolutionIndex(-1);
			return;
		}
		const firstResolutionIndex = resolutionOrder.findIndex(
			(resolution) => image && image[resolution],
		);

		setDisplayResolutionIndex(firstResolutionIndex);
	}, [image]);

	const [imageErrorMessages, setImageErrorMessages] = useState<
		Partial<Record<keyof ImageInfo, string>>
	>({
		regular: "",
		thumbnail: "",
		hd: "",
	});

	const currentEntry =
		displayResolutionIndex >= 0
			? image?.[resolutionOrder[displayResolutionIndex]]
			: undefined;

	const resolvedSrc = useResolveMessageFile(currentEntry?.uri);

	const onImageError = (
		error: React.SyntheticEvent<HTMLImageElement, Event>,
	) => {
		if (!image) return;

		setImageErrorMessages((prev) => {
			return {
				...prev,
				[resolutionOrder[displayResolutionIndex]]: "错误",
			};
		});

		if (displayResolutionIndex === resolutionOrder.length - 1) {
			setDisplayResolutionIndex(0);
		} else {
			setDisplayResolutionIndex(displayResolutionIndex + 1);
		}
	};

	return (
		<Image
			ref={ref}
			src={resolvedSrc}
			width={currentEntry?.width}
			height={currentEntry?.height}
			loading="lazy"
			onError={onImageError}
			{...props}
		/>
	);
}
