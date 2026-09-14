import { MessageTypeEnum } from "@repo/types";
import type { VirtualItem } from "@tanstack/react-virtual";
import { getMessageKey } from "../../-lib/message-key";
import type { MessageListLayout, MessageListRow } from "./message-list-layout";

const MESSAGE_LIST_SPACING = 8;
const MESSAGE_LIST_TIME_HEIGHT = 20;
export const MESSAGE_LIST_ITEM_PADDING = MESSAGE_LIST_SPACING / 2;
export const MESSAGE_LIST_USERNAME_HEIGHT = 22;
export const MESSAGE_LIST_PADDING_START = 112;
export const MESSAGE_LIST_PADDING_END = 48;

export interface MessageListItem {
	key: string;
	row: MessageListRow;
	showUsername: boolean;
	timePaddingTop: number | undefined;
	leadingSize: number;
	trailingSize: number;
}

interface AvatarRange {
	key: string;
	row: MessageListRow;
	startIndex: number;
	endIndex: number;
	nameHeight: number;
	trailingSize: number;
}

export function createMessageListItems(
	layout: MessageListLayout,
	showUsername: boolean,
) {
	const items: MessageListItem[] = layout.rows.map((row, index) => {
		const { message } = row;
		const key = getMessageKey(message.chat_id, message.local_id);
		const name = row.isSenderGroupStart && showUsername;
		const timePaddingTop = row.isTimeSectionStart
			? index
				? 16
				: 0
			: undefined;
		const timeSize =
			timePaddingTop === undefined
				? 0
				: timePaddingTop + MESSAGE_LIST_TIME_HEIGHT + MESSAGE_LIST_SPACING;
		const senderSize =
			row.isSenderGroupStart || row.senderGroupIndex === undefined
				? (name ? MESSAGE_LIST_USERNAME_HEIGHT : 0) + MESSAGE_LIST_SPACING
				: 0;
		return {
			key,
			row,
			showUsername: name,
			timePaddingTop,
			leadingSize: timeSize + senderSize,
			trailingSize: 0,
		};
	});

	// Reserve headings after the preceding bubble, never inside the next bubble's scroll anchor.
	// Prepending can remove a heading without changing any existing bubble's measured origin.
	for (let index = 0; index < items.length - 1; index++) {
		items[index].trailingSize = items[index + 1].leadingSize;
	}
	const avatars: AvatarRange[] = layout.senderGroups.map((group) => {
		const first = items[group.startIndex];
		const last = items[group.endIndex - 1];
		return {
			key: first.key,
			row: first.row,
			startIndex: group.startIndex,
			endIndex: group.endIndex - 1,
			nameHeight: first.showUsername ? MESSAGE_LIST_USERNAME_HEIGHT : 0,
			trailingSize: last.trailingSize,
		};
	});
	return { items, avatars };
}

export function estimateMessageListItem(item: MessageListItem): number {
	let size: number;
	switch (item.row.message.type) {
		case MessageTypeEnum.IMAGE:
		case MessageTypeEnum.VIDEO:
			size = 220;
			break;
		case MessageTypeEnum.SYSTEM:
		case MessageTypeEnum.SYSTEM_EXTENDED:
			size = 24;
			break;
		default:
			size = 64;
	}
	return size + item.trailingSize + 2 * MESSAGE_LIST_ITEM_PADDING;
}

export function getMessageAvatarBounds(
	range: AvatarRange,
	measurements: readonly VirtualItem[],
) {
	const first = measurements[range.startIndex];
	const last = measurements[range.endIndex];
	const top = first.start + MESSAGE_LIST_ITEM_PADDING - range.nameHeight;
	return {
		top,
		height: Math.max(
			44,
			last.end - range.trailingSize - MESSAGE_LIST_ITEM_PADDING - top,
		),
	};
}

export function getMessageHighlightBounds(
	index: number,
	items: readonly MessageListItem[],
	measurements: readonly VirtualItem[],
) {
	const item = items[index];
	const measurement = measurements[index];
	const contentTop =
		measurement.start +
		MESSAGE_LIST_ITEM_PADDING -
		(item.showUsername ? MESSAGE_LIST_USERNAME_HEIGHT : 0);
	const contentBottom =
		measurement.end - item.trailingSize - MESSAGE_LIST_ITEM_PADDING;

	// Time labels are separate content blocks when finding adjacent boundaries.
	let previousBottom = contentTop - MESSAGE_LIST_SPACING;
	if (item.timePaddingTop !== undefined) {
		previousBottom =
			measurement.start +
			MESSAGE_LIST_ITEM_PADDING -
			item.leadingSize +
			item.timePaddingTop +
			MESSAGE_LIST_TIME_HEIGHT;
	} else if (index > 0) {
		previousBottom =
			measurements[index - 1].end -
			items[index - 1].trailingSize -
			MESSAGE_LIST_ITEM_PADDING;
	}
	let nextTop = contentBottom + MESSAGE_LIST_SPACING;
	const next = items[index + 1];
	if (next) {
		nextTop = measurements[index + 1].start + MESSAGE_LIST_ITEM_PADDING;
		if (next.timePaddingTop !== undefined) {
			nextTop += next.timePaddingTop - next.leadingSize;
		} else if (next.showUsername) {
			nextTop -= MESSAGE_LIST_USERNAME_HEIGHT;
		}
	}
	const padding =
		Math.min(contentTop - previousBottom, nextTop - contentBottom) / 2;
	return {
		top: contentTop - padding,
		height: contentBottom - contentTop + 2 * padding,
	};
}
