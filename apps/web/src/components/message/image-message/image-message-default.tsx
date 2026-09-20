import { useRender } from "@base-ui/react/use-render";
import { useInViewport, useResizeObserver } from "@mantine/hooks";
import { MessageDirection, type ImageMessageType } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import {
	type CSSProperties,
	type ImgHTMLAttributes,
	type Ref,
	useState,
} from "react";
import { useAccount } from "@/components/account-provider.tsx";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { cn } from "@/lib/utils.ts";
import { ImageMessageCarouselTarget } from "./image-message-carousel-target";
import classes from "./image-message.module.css";
import type { ImageMessageProps } from "./types.ts";

export interface ImageMessageDefaultProps extends ImageMessageProps {
	renderRoot?: useRender.RenderProp;
	ref?: Ref<HTMLElement>;
}

export function ImageMessageDefault({
	message,
	className,
	style,
	renderRoot,
	ref,
	...props
}: ImageMessageDefaultProps) {
	const { accountId } = useAccount();
	const { ref: imageRef, inViewport } = useInViewport();
	const { data: image } = useQuery({
		...MessageImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
		}),
		enabled: inViewport,
	});
	const thumbnailOnly = Boolean(
		image?.thumbnail && !image.hd && !image.regular,
	);
	const metadataDimensions = getMessageDimensions(message, thumbnailOnly);
	const [loadedImage, setLoadedImage] = useState<{
		src: string;
		width: number;
		height: number;
	}>();
	// Metadata may describe a cropped thumbnail rather than the displayed file.
	const aspectRatio = loadedImage
		? loadedImage.width / loadedImage.height
		: metadataDimensions?.aspectRatio;
	const imageWidth = loadedImage?.width ?? metadataDimensions?.width;
	const [bodyRef, bodySize] = useResizeObserver<HTMLDivElement>();
	// Ignore subpixel rounding when comparing the bubble with the fitted image.
	const hasBlurredBackground =
		aspectRatio !== undefined &&
		Math.min(
			Math.abs(bodySize.width - bodySize.height * aspectRatio),
			Math.abs(bodySize.height - bodySize.width / aspectRatio),
		) > 1;
	const imageProps: ImgHTMLAttributes<HTMLImageElement> = {
		className: classes.image,
		// Decorations reuse the foreground's resolved resource and resolution fallback.
		onLoad: ({ currentTarget }) =>
			setLoadedImage({
				src: currentTarget.currentSrc,
				width: currentTarget.naturalWidth,
				height: currentTarget.naturalHeight,
			}),
	};

	const thumbnailSrc = useResolveMessageFile(
		hasBlurredBackground ? image?.thumbnail?.uri : undefined,
	);
	const backgroundSrc = thumbnailSrc ?? loadedImage?.src;

	return useRender({
		render: renderRoot,
		ref,
		props: {
			...props,
			className: cn(
				classes.root,
				message.direction === MessageDirection.outgoing
					? "bubble-tail-r"
					: "bubble-tail-l",
				className,
			),
			"data-blurred-background": hasBlurredBackground ? "" : undefined,
			style: {
				"--image-ratio": aspectRatio,
				"--image-width": imageWidth ? `${imageWidth}px` : undefined,
				...style,
			} as CSSProperties,
			children: (
				<>
					<div
						className={classes.background}
						aria-hidden="true"
						style={
							{
								"--background-image": backgroundSrc
									? `url("${backgroundSrc}")`
									: undefined,
							} as CSSProperties
						}
					/>
					<div ref={bodyRef} className={classes.body}>
						<ImageMessageCarouselTarget
							ref={imageRef}
							message={message}
							image={image}
							{...imageProps}
						/>
					</div>
					{!hasBlurredBackground && loadedImage && (
						<div
							className={classes.tail}
							aria-hidden="true"
							style={
								{ "--tail-image": `url("${loadedImage.src}")` } as CSSProperties
							}
						/>
					)}
				</>
			),
		},
	});
}

function getMessageDimensions(
	message: ImageMessageType,
	thumbnailOnly: boolean,
) {
	const img = message.message_entity.msg.img;
	for (const size of ["cdnhd", "cdnmid", "cdnthumb"] as const) {
		if (thumbnailOnly && size !== "cdnthumb") continue;
		const width = Number(img[`@_${size}width`]);
		const height = Number(img[`@_${size}height`]);
		if (width > 0 && height > 0) {
			return {
				aspectRatio: width / height,
				// A thumbnail can estimate a larger file's ratio, but not its pixel width.
				width: size !== "cdnthumb" || thumbnailOnly ? width : undefined,
			};
		}
	}
}
