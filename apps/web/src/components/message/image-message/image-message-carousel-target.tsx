import type { ImageMessageType } from "@repo/types";
import { useContext, type Ref, type ImgHTMLAttributes } from "react";
import Image from "@/components/image.tsx";
import { ViewTransition } from "@/components/view-transition";
import {
	ChatMediaCarouselContext,
	ChatMediaCarouselSourceEnabledContext,
} from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/chat-media-carousel-context.tsx";
import transitionClasses from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/media-carousel-transition.module.css";
import {
	createMessageURI,
	isImageReady,
} from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/utils";

export function ImageMessageCarouselTarget({
	message,
	ref,
	...props
}: {
	message: ImageMessageType;
	ref?: Ref<HTMLImageElement>;
} & ImgHTMLAttributes<HTMLImageElement>) {
	const carousel = useContext(ChatMediaCarouselContext);
	const sourceEnabled = useContext(ChatMediaCarouselSourceEnabledContext);
	const messageKey = carousel
		? createMessageURI({ account: carousel.account, message })
		: null;
	const element = <Image ref={ref} {...props} />;
	return carousel && sourceEnabled ? (
		<ViewTransition.Target
			targetKey={`chat:${messageKey}`}
			data-carousel-current={
				carousel.currentMessageKey === messageKey ? "" : undefined
			}
			isReady={isImageReady}
			className={transitionClasses.Target}
			render={element}
		/>
	) : (
		element
	);
}
