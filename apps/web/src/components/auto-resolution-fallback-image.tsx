import type { ImageInfo } from "@repo/types";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Image from "@/components/image.tsx";
import {
	ReleaseMessageImageMutationOptions,
	ResolveMessageImageMutationOptions,
} from "@/lib/fetchers/message-image";

const resolutionOrder: (keyof ImageInfo)[] = ["hd", "regular", "thumbnail"];

export default function AutoResolutionFallbackImage({
	image,
	ref,
	...props
}: {
	image?: ImageInfo | null;
	ref?: React.Ref<HTMLImageElement>;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
	const { mutateAsync: resolveMessageImage } = useMutation(
		ResolveMessageImageMutationOptions(),
	);
	const { mutateAsync: releaseMessageImage } = useMutation(
		ReleaseMessageImageMutationOptions(),
	);

	const [displayResolutionIndex, setDisplayResolutionIndex] = useState(-1);
	const [resolvedSrc, setResolvedSrc] = useState<string>();

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
	const currentUri = currentEntry?.uri;

	// 仅在真正需要显示某个分辨率时才向适配器解析其 src（懒加载），
	// 卸载或切换分辨率时释放，由适配器内部引用计数决定何时真正回收资源。
	useEffect(() => {
		setResolvedSrc(undefined);
		if (!currentUri) return;

		let isActive = true;

		resolveMessageImage({ uri: currentUri })
			.then((res) => {
				if (isActive) setResolvedSrc(res.data.src);
			})
			.catch((error) => {
				console.error(
					`[AutoResolutionFallbackImage] Failed to resolve ${currentUri}:`,
					error,
				);
			});

		return () => {
			isActive = false;
			releaseMessageImage({ uri: currentUri }).catch(() => {});
		};
	}, [currentUri]);

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
