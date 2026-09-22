import { useRender } from "@base-ui/react/use-render";
import { useInViewport, useResizeObserver } from "@mantine/hooks";
import { MessageDirection } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties, Ref } from "react";
import { useAccount } from "@/components/account-provider.tsx";
import {
	useAutoResolutionImage,
	type ImageResolution,
} from "@/hooks/use-auto-resolution-image";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { ResolvedImageQueryOptions } from "@/lib/fetchers/resolved-image";
import { cn } from "@/lib/utils.ts";
import { ImageMessageCarouselTarget } from "./image-message-carousel-target";
import classes from "./image-message.module.css";
import type { ImageMessageProps } from "./types.ts";

const resolutionOrder: readonly ImageResolution[] = [
	"regular",
	"hd",
	"thumbnail",
];

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
	const { data: image } = useQuery(
		MessageImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
		}),
	);
	const { target, targetImage, ratioDimensions, displayedImage, isError } =
		useAutoResolutionImage(image, { resolutionOrder, enabled: inViewport });
	// The decoded file replaces the selected version's metadata.
	const dimensions = targetImage ?? target;
	const aspectRatio =
		ratioDimensions?.width && ratioDimensions.height
			? ratioDimensions.width / ratioDimensions.height
			: undefined;
	const imageWidth = dimensions?.width;
	const displayedRatio = displayedImage
		? displayedImage.width / displayedImage.height
		: aspectRatio;
	const [bodyRef, bodySize] = useResizeObserver<HTMLDivElement>();
	// Ignore subpixel rounding when comparing the bubble with the fitted image.
	const hasBlurredBackground =
		displayedRatio !== undefined &&
		Math.min(
			Math.abs(bodySize.width - bodySize.height * displayedRatio),
			Math.abs(bodySize.height - bodySize.width / displayedRatio),
		) > 1;

	const { data: thumbnailImage } = useQuery({
		...ResolvedImageQueryOptions(image?.thumbnail?.uri),
		enabled: inViewport && hasBlurredBackground,
	});
	// Decorations reuse the foreground's resolved resource and resolution fallback.
	const backgroundSrc = thumbnailImage?.src ?? displayedImage?.src;

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
							className={classes.image}
							src={displayedImage?.src}
							width={displayedImage?.width}
							height={displayedImage?.height}
							data-state={isError ? "error" : undefined}
							// A cached preview keeps its own ratio without changing the target layout.
							style={{ "--image-ratio": displayedRatio } as CSSProperties}
						/>
					</div>
					{!hasBlurredBackground && displayedImage && (
						<div
							className={classes.tail}
							aria-hidden="true"
							style={
								{
									"--tail-image": `url("${displayedImage.src}")`,
								} as CSSProperties
							}
						/>
					)}
				</>
			),
		},
	});
}
