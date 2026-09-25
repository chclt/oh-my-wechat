import { useRender } from "@base-ui/react/use-render";
import { useInViewport } from "@mantine/hooks";
import { MessageDirection } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import {
	type CSSProperties,
	type Ref,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
	const bodyRef = useRef<HTMLSpanElement>(null);
	const layout = useMemo(
		() => ({ aspectRatio, imageWidth, displayedRatio }),
		[aspectRatio, imageWidth, displayedRatio],
	);
	const [blurredLayout, setBlurredLayout] = useState<typeof layout>();
	useEffect(() => {
		if (layout.displayedRatio === undefined) return;
		const ratio = layout.displayedRatio;
		const body = bodyRef.current!;
		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			// Ignore subpixel rounding when comparing the bubble with the fitted image.
			const hasGap =
				Math.min(
					Math.abs(width - height * ratio),
					Math.abs(height - width / ratio),
				) > 1;
			setBlurredLayout(hasGap ? layout : undefined);
		});
		observer.observe(body);
		return () => observer.disconnect();
	}, [layout]);
	// A previous layout must not trigger a thumbnail request for new dimensions.
	const hasBlurredBackground = blurredLayout === layout;

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
					<span
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
					<span ref={bodyRef} className={classes.body}>
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
					</span>
					{!hasBlurredBackground && displayedImage && (
						<span
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
