import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useQueryClient } from "@tanstack/react-query";
import { useContext, type Ref } from "react";
import { ChatMediaCarouselTriggerContext } from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/chat-media-carousel-context.tsx";
import { MediaListInfiniteQueryOptions } from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/utils";
import type { ImageMessageProps } from "./types.ts";

export function ImageMessageCarouselTrigger({
	message,
	ref,
	...props
}: ImageMessageProps & { ref?: Ref<HTMLElement> }) {
	const carousel = useContext(ChatMediaCarouselTriggerContext);
	const queryClient = useQueryClient();
	return useRender({
		defaultTagName: carousel ? "button" : "div",
		ref,
		props: mergeProps<"button">(
			carousel
				? {
						type: "button",
						"aria-label": "查看图片",
						"aria-haspopup": "dialog",
						onClick: () => {
							const messageAnchor = {
								local_id: message.local_id,
								date: message.date,
							};
							const { queryKey, initialPageParam } =
								MediaListInfiniteQueryOptions({
									account: carousel.account,
									chat: { id: message.chat_id },
									initialMessageAnchor: messageAnchor,
								});
							if (queryClient.getQueryData(queryKey) === undefined) {
								queryClient.setQueryData(queryKey, {
									pages: [{ data: [message], meta: {} }],
									pageParams: [initialPageParam],
								});
								// This page only seeds the current item. Fetch its neighbors
								// on mount, even with the global infinite staleTime.
								void queryClient.invalidateQueries({
									queryKey,
									exact: true,
									refetchType: "none",
								});
							}
							carousel.openChatMediaCarousel(messageAnchor);
						},
					}
				: {},
			props,
		),
	});
}
