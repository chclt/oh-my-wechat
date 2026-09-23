import {
	defaultRangeExtractor,
	measureElement,
	observeElementOffset,
	useVirtualizer,
	type Range,
	type Virtualizer,
} from "@tanstack/react-virtual";
import { useCallback, useRef, useState } from "react";
import {
	estimateMessageListItem,
	MESSAGE_LIST_ITEM_PADDING,
	MESSAGE_LIST_PADDING_END,
	MESSAGE_LIST_PADDING_START,
	type MessageListItem,
} from "./message-list-items";
import {
	getMessageScrollPlan,
	type MessageListScroll,
	type MessageScrollDirection,
} from "./message-list-scroll";

interface VirtualizerOptions {
	targetIndex: number;
	positioning: boolean;
	behavior: "instant" | "smooth";
	initialDirection?: MessageScrollDirection;
	scrollToFn: MessageListScroll["scrollToFn"];
	onScroll?: (
		instance: Virtualizer<HTMLDivElement, HTMLDivElement>,
		offset: number,
	) => void;
}

export function useMessageListVirtualizer(
	items: readonly MessageListItem[],
	viewport: HTMLDivElement | null,
	{
		targetIndex,
		positioning,
		behavior,
		initialDirection,
		scrollToFn,
		onScroll,
	}: VirtualizerOptions,
) {
	"use no memo";
	const instanceRef = useRef<Virtualizer<
		HTMLDivElement,
		HTMLDivElement
	> | null>(null);
	const measuredKeys = useRef(new Set<string>());
	const prependAnchorIndex = useRef<number | null>(null);
	// Virtualizer subscribes once per viewport; the listener must read current options.
	const scrollOptions = useRef({ positioning, onScroll });
	scrollOptions.current = { positioning, onScroll };
	const previous = instanceRef.current;
	if (
		previous &&
		previous.options.count > 0 &&
		previous.options.getItemKey(0) !== items[0]?.key
	) {
		// Preserve the existing message, including any space above it. The default
		// fold-based resize anchor can instead pick a newly prepended row in that space.
		const anchor = previous.getVirtualItemForOffset(previous.scrollOffset ?? 0);
		const index = items.findIndex((item) => item.key === anchor?.key);
		prependAnchorIndex.current = index >= 0 ? index : null;
	}
	const [retainedKey, retainFocusedItem] = useState<string>();
	const retainedIndex =
		retainedKey === undefined
			? -1
			: items.findIndex((item) => item.key === retainedKey);
	const getItemKey = useCallback((index: number) => items[index].key, [items]);
	const isPrepared = useCallback(
		() =>
			instanceRef.current
				?.getVirtualItems()
				.every((item) => measuredKeys.current.has(String(item.key))) ?? false,
		[],
	);
	const rangeExtractor = (range: Range) => {
		const indexes = new Set(defaultRangeExtractor(range));
		if (retainedIndex >= 0) indexes.add(retainedIndex);
		const measurements = instanceRef.current?.measurementsCache;
		const destination = measurements?.[targetIndex];
		if (positioning && targetIndex >= 0) {
			indexes.add(targetIndex);
			if (destination && measurements && viewport) {
				const plan = getMessageScrollPlan({
					start: destination.start,
					size: destination.size - items[targetIndex].trailingSize,
					scrollTop: viewport.scrollTop,
					viewportHeight: viewport.clientHeight,
					maxOffset: Math.max(
						0,
						(instanceRef.current?.getTotalSize() ?? 0) - viewport.clientHeight,
					),
					initialDirection,
				});
				// Premeasure the short animation corridor, not the entire distance to a far target.
				const from =
					behavior === "instant"
						? plan.offset
						: (plan.stagingOffset ?? viewport.scrollTop);
				const start = Math.min(from, plan.offset) - viewport.clientHeight;
				const end = Math.max(from, plan.offset) + 2 * viewport.clientHeight;
				for (
					let i = targetIndex - 1;
					i >= 0 && measurements[i].end >= start;
					i--
				)
					indexes.add(i);
				for (
					let i = targetIndex + 1;
					i < items.length && measurements[i].start <= end;
					i++
				)
					indexes.add(i);
			}
		}
		return Array.from(indexes).sort((a, b) => a - b);
	};
	// Edge half-spacing is already inside the first and last rows.
	const paddingStart =
		MESSAGE_LIST_PADDING_START +
		(items[0]?.leadingSize ?? 0) -
		MESSAGE_LIST_ITEM_PADDING;
	const paddingEnd = MESSAGE_LIST_PADDING_END - MESSAGE_LIST_ITEM_PADDING;
	const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
		count: items.length,
		getScrollElement: () => viewport,
		getItemKey,
		scrollToFn,
		estimateSize: (index) => estimateMessageListItem(items[index]),
		measureElement: (element, entry, instance) => {
			if (entry) {
				measuredKeys.current.add(
					getItemKey(instance.indexFromElement(element)),
				);
				return measureElement(element, entry, instance);
			}
			// Measure in ResizeObserver before paint, not inside React's ref/commit phase.
			const index = instance.indexFromElement(element);
			return (
				instance.itemSizeCache.get(instance.options.getItemKey(index)) ??
				instance.options.estimateSize(index)
			);
		},
		observeElementOffset: (instance, callback) =>
			observeElementOffset(instance, (offset, isScrolling) => {
				// Library adjustments update scrollOffset eagerly; a different native
				// offset releases the prepend anchor for ordinary scrolling.
				if (
					!scrollOptions.current.positioning &&
					Math.abs(offset - (instance.scrollOffset ?? 0)) > 1
				) {
					prependAnchorIndex.current = null;
					instance.shouldAdjustScrollPositionOnItemSizeChange = undefined;
				}
				callback(offset, isScrolling);
				scrollOptions.current.onScroll?.(instance, offset);
			}),
		rangeExtractor,
		gap: 0,
		paddingStart,
		paddingEnd,
		anchorTo: positioning ? "start" : "end",
		overscan: 6,
		initialOffset: () =>
			targetIndex >= 0
				? Math.max(
						0,
						paddingStart +
							items
								.slice(0, targetIndex)
								.reduce(
									(total, item) => total + estimateMessageListItem(item),
									0,
								) +
							(estimateMessageListItem(items[targetIndex]) -
								items[targetIndex].trailingSize -
								(viewport?.clientHeight ?? 0)) /
								2 -
							(initialDirection ?? 0) * (viewport?.clientHeight ?? 0),
					)
				: Math.max(
						0,
						paddingStart +
							paddingEnd +
							items.reduce(
								(total, item) => total + estimateMessageListItem(item),
								0,
							) -
							(viewport?.clientHeight ?? 0),
					),
	});
	instanceRef.current = virtualizer;
	// Explicit positioning owns the offset until it completes or is interrupted.
	virtualizer.shouldAdjustScrollPositionOnItemSizeChange = positioning
		? () => false
		: prependAnchorIndex.current !== null
			? (item) => item.index < (prependAnchorIndex.current ?? 0)
			: undefined;

	return {
		virtualizer,
		isPrepared,
		retainFocusedItem,
	};
}

export interface MessageListGeometry {
	virtualizer: Virtualizer<HTMLDivElement, HTMLDivElement>;
	isPrepared: () => boolean;
}
