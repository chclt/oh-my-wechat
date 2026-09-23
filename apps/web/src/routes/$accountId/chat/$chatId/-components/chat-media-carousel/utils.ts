import { MessageTypeEnum, type MessageType } from "@repo/types";
import type { MessageListCursor } from "@repo/types/adapter";
import { MessageListInfiniteQueryOptions } from "@/lib/fetchers/message";
import type { MediaPreviewData } from "./media-carousel-preview-context";
import type { CarouselMessageAnchor } from "./types";

export interface MediaPagesOptions {
	account: { id: string };
	chat: { id: string };
	initialMessageAnchor: CarouselMessageAnchor;
}

export function MediaListInfiniteQueryOptions({
	account,
	chat,
	initialMessageAnchor,
}: MediaPagesOptions) {
	return MessageListInfiniteQueryOptions({
		account,
		chat,
		type: [MessageTypeEnum.IMAGE, MessageTypeEnum.VIDEO],
		cursor: JSON.stringify({
			value: initialMessageAnchor.date,
			messageLocalId: initialMessageAnchor.local_id,
			condition: "<>",
		} satisfies MessageListCursor),
		limit: 5,
	});
}

export function readMediaPreview(
	image: HTMLElement | null,
	messageImage: HTMLElement | null = image,
): MediaPreviewData | null {
	if (!(image instanceof HTMLImageElement) || !isImageReady(image)) return null;
	const src = image.currentSrc || image.src;
	return {
		src,
		width: image.naturalWidth,
		height: image.naturalHeight,
		hasBlurredBackground: !!messageImage?.closest("[data-blurred-background]"),
	};
}

/** Image targets render an img; reserved layout alone does not make it visible content. */
export function isImageReady(element: HTMLElement) {
	const image = element as HTMLImageElement;
	return image.complete && image.naturalWidth > 0;
}

export function createMessageURI({
	message,
	account,
}: {
	message: Pick<MessageType, "chat_id" | "local_id">;
	account: { id: string };
}) {
	return `omw:account:${account.id}:chat:${message.chat_id}:message:${message.local_id}`;
}
