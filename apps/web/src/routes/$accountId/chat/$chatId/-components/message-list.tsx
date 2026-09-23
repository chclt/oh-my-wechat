import { MessageDirection, type MessageType } from "@repo/types";
import type { DataAdapterCursorPagination } from "@repo/types/adapter";
import type {
	InfiniteData,
	UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { Fragment, useMemo, useRef, useState, type RefObject } from "react";
import { useChatUiConfig } from "@/components/chat-ui-config-provider";
import Message from "@/components/message/message";
import User from "@/components/user";
import { cn } from "@/lib/utils";
import {
	getMessageTargetKey,
	type MessageListTarget,
} from "../../-lib/message-target";
import { ChatMediaCarouselSourceEnabledContext } from "./chat-media-carousel/chat-media-carousel-context";
import { MessageListHighlight } from "./message-list-highlight";
import {
	createMessageListItems,
	getMessageAvatarBounds,
	getMessageHighlightBounds,
	MESSAGE_LIST_ITEM_PADDING,
	MESSAGE_LIST_USERNAME_HEIGHT,
} from "./message-list-items";
import { createMessageListLayout } from "./message-list-layout";
import MessageListPageStatus from "./message-list-page-status";
import MessageListPreview from "./message-list-preview";
import type { MessageScrollOrigin } from "./message-list-scroll";
import { useMessageListPagination } from "./use-message-list-pagination";
import {
	matchesPositionRequest,
	useMessageListPosition,
	type PositionRequest,
} from "./use-message-list-position";
import {
	useMessageListVirtualizer,
	type MessageListGeometry,
} from "./use-message-list-virtualizer";

interface MessageListProps {
	messageListInfiniteQueryResult: UseInfiniteQueryResult<
		InfiniteData<DataAdapterCursorPagination<MessageType[]>, unknown>,
		Error
	>;
	viewport: HTMLDivElement | null;
	target?: MessageListTarget;
	positionRequestId?: string;
	scrollOriginRef?: RefObject<MessageScrollOrigin | null>;
	positionEnabled?: boolean;
	visible?: boolean;
	onPrepared?: (valid: boolean) => void;
}

export default function MessageList({
	messageListInfiniteQueryResult: query,
	viewport,
	target,
	positionRequestId,
	scrollOriginRef,
	positionEnabled = true,
	visible = true,
	onPrepared,
}: MessageListProps) {
	"use no memo";
	const { showUsername, showPhoto } = useChatUiConfig();
	const layout = useMemo(
		() =>
			createMessageListLayout(
				query.data?.pages.flatMap((page) => page.data) ?? [],
			),
		[query.data?.pages],
	);
	const { items, avatars } = useMemo(
		() => createMessageListItems(layout, showUsername),
		[layout, showUsername],
	);
	const targetKey = getMessageTargetKey(target);
	const targetIndex = useMemo(
		() =>
			target
				? layout.rows.findIndex(
						(row) => row.message.local_id === target.messageLocalId,
					)
				: -1,
		[layout.rows, target],
	);
	const geometryRef = useRef<MessageListGeometry | null>(null);
	const [highlight, setHighlight] = useState<PositionRequest | null>(null);
	const position = useMessageListPosition(
		geometryRef,
		viewport,
		targetKey,
		targetIndex,
		items,
		positionRequestId,
		{
			enabled: positionEnabled,
			visible,
			scrollOriginRef,
			onPrepared,
			onTargetReady: setHighlight,
		},
	);
	const geometry = useMessageListVirtualizer(items, viewport, {
		targetIndex,
		positioning: position.pending,
		behavior: position.behavior,
		initialDirection: position.initialDirection,
		scrollToFn: position.scrollToFn,
		onScroll: position.onScroll,
	});
	geometryRef.current = geometry;
	const { virtualizer, retainFocusedItem } = geometry;
	const highlightedTarget =
		positionEnabled &&
		matchesPositionRequest(highlight, targetKey, positionRequestId)
			? highlight
			: null;
	const virtualItems = virtualizer.getVirtualItems();
	const highlightedItem = highlightedTarget
		? virtualizer.measurementsCache[targetIndex]
		: undefined;
	const highlightBounds = highlightedItem
		? getMessageHighlightBounds(
				targetIndex,
				items,
				virtualizer.measurementsCache,
			)
		: undefined;
	const visibleGroups = new Set(
		virtualItems.flatMap(({ index }) => {
			const group = items[index].row.senderGroupIndex;
			return group === undefined ? [] : [group];
		}),
	);

	useMessageListPagination(
		query,
		visible && !position.pending,
		virtualizer.range?.startIndex,
		virtualizer.range?.endIndex,
		items.length,
	);

	return (
		<div
			role="list"
			aria-label="聊天记录"
			aria-busy={position.pending}
			className="relative isolate"
			style={{
				height: virtualizer.getTotalSize(),
				visibility: position.hidden ? "hidden" : undefined,
			}}
		>
			{visible && (
				<MessageListPreview
					items={items}
					measurements={virtualizer.measurementsCache}
				/>
			)}
			{/* Preview clips to the full scroll content; only messages are width-limited. */}
			<div className="relative mx-auto h-full max-w-3xl">
				{highlightBounds && highlightedTarget && (
					<MessageListHighlight
						key={JSON.stringify([
							highlightedTarget.targetKey,
							highlightedTarget.requestId,
						])}
						{...highlightBounds}
					/>
				)}
				{query.hasPreviousPage && (
					<MessageListPageStatus
						position="top"
						failed={query.isFetchPreviousPageError}
						onRetry={() =>
							void query.fetchPreviousPage({ cancelRefetch: false })
						}
					/>
				)}
				{virtualItems.map((virtualItem) => {
					const item = items[virtualItem.index];
					const { message, isSenderGroupStart, senderGroupIndex } = item.row;
					const outgoing = message.direction === MessageDirection.outgoing;
					const grouped = senderGroupIndex !== undefined;
					const bodyClassName = cn(
						grouped && (outgoing ? "ms-14" : "me-14"),
						grouped && showPhoto && (outgoing ? "me-14" : "ms-14"),
					);

					return (
						<Fragment key={item.key}>
							{item.timePaddingTop !== undefined && (
								<div
									data-message-kind="time"
									className="absolute inset-x-4 top-0 text-center text-sm leading-5 text-neutral-600"
									style={{
										transform: `translateY(${virtualItem.start + MESSAGE_LIST_ITEM_PADDING - item.leadingSize}px)`,
										paddingTop: item.timePaddingTop,
									}}
								>
									<time dateTime={new Date(message.date * 1000).toISOString()}>
										{format(new Date(message.date * 1000), "yyyy/MM/dd HH:mm")}
									</time>
								</div>
							)}
							{item.showUsername && (
								<div
									data-message-kind="sender"
									aria-hidden="true"
									className="absolute inset-x-4 top-0"
									style={{
										transform: `translateY(${virtualItem.start + MESSAGE_LIST_ITEM_PADDING - MESSAGE_LIST_USERNAME_HEIGHT + 1}px)`,
									}}
								>
									<div className={cn("relative", bodyClassName)}>
										<User.Username
											user={message.from}
											variant="default"
											className={cn(
												"absolute top-0 max-w-full truncate text-[13px] leading-[14px] text-neutral-500",
												outgoing ? "end-0.5" : "start-0.5",
											)}
										/>
									</div>
								</div>
							)}
							<div
								ref={virtualizer.measureElement}
								data-index={virtualItem.index}
								data-message-key={item.key}
								data-message-kind="message"
								role="listitem"
								onFocusCapture={() => retainFocusedItem(item.key)}
								className="absolute inset-x-4 top-0"
								style={{
									transform: `translateY(${virtualItem.start}px)`,
									paddingTop: MESSAGE_LIST_ITEM_PADDING,
									paddingBottom: item.trailingSize + MESSAGE_LIST_ITEM_PADDING,
								}}
							>
								<div
									className={cn(
										"flex flex-col min-w-0",
										bodyClassName,
										grouped
											? outgoing
												? "items-end"
												: "items-start"
											: "items-stretch",
										grouped && showPhoto && isSenderGroupStart && "min-h-11",
									)}
								>
									{grouped && (
										<span className="sr-only">
											{message.from.remark ??
												message.from.username ??
												message.from.id}
											：
										</span>
									)}
									<div
										data-sender-group-start={
											grouped ? isSenderGroupStart : undefined
										}
										className={cn(
											grouped ? "w-fit max-w-full" : "w-full",
											!isSenderGroupStart &&
												"[&>.bubble-tail-l]:bubble-tail-none [&>.bubble-tail-r]:bubble-tail-none",
										)}
									>
										<ChatMediaCarouselSourceEnabledContext value={visible}>
											<Message
												message={message}
												variant="default"
												data-show-username={item.showUsername}
											/>
										</ChatMediaCarouselSourceEnabledContext>
									</div>
								</div>
							</div>
						</Fragment>
					);
				})}
				{showPhoto &&
					Array.from(visibleGroups, (groupIndex) => {
						const group = avatars[groupIndex];
						const bounds = getMessageAvatarBounds(
							group,
							virtualizer.measurementsCache,
						);
						return (
							<div
								key={group.key}
								data-slot="message-avatar-track"
								aria-hidden="true"
								className={cn(
									"pointer-events-none absolute w-11",
									group.row.message.direction === MessageDirection.outgoing
										? "end-4"
										: "start-4",
								)}
								style={bounds}
							>
								<User.Photo
									user={group.row.message.from}
									variant="default"
									className="sticky top-20"
								/>
							</div>
						);
					})}
				{query.hasNextPage && (
					<MessageListPageStatus
						position="bottom"
						failed={query.isFetchNextPageError}
						onRetry={() => void query.fetchNextPage({ cancelRefetch: false })}
					/>
				)}
			</div>
		</div>
	);
}
