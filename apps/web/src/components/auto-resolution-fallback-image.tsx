import Image from "@/components/image.tsx";
import type { ImageInfo } from "@/schema";
import React, { useEffect, useState } from "react";

export default function AutoResolutionFallbackImage({
	image,
	ref,
	...props
}: {
	image?: ImageInfo | null;
	ref?: React.Ref<HTMLImageElement>;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
	const resolutionOrder: (keyof ImageInfo)[] = ["hd", "regular", "thumbnail"];

	const [displayResolutionIndex, setDisplayResolutionIndex] = useState(-1);

	useEffect(() => {
		if (!image) return;
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
			src={image?.[resolutionOrder[displayResolutionIndex]]?.src}
			width={image?.[resolutionOrder[displayResolutionIndex]]?.width}
			height={image?.[resolutionOrder[displayResolutionIndex]]?.height}
			loading="lazy"
			onError={onImageError}
			{...props}
		/>
	);
}
