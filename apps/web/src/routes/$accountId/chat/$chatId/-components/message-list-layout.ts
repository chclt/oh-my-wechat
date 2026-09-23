import {
	MessageTypeEnum,
	OpenMessageTypeEnum,
	type MessageType,
} from "@repo/types";
import { differenceInMinutes, isSameDay } from "date-fns";

export interface MessageListRow {
	message: MessageType;
	isTimeSectionStart: boolean;
	isSenderGroupStart: boolean;
	senderGroupIndex: number | undefined;
}

/** Ranges are [startIndex, endIndex) in the full loaded list, not the visible window. */
export interface MessageListRange {
	startIndex: number;
	endIndex: number;
}

export interface MessageListLayout {
	rows: MessageListRow[];
	senderGroups: MessageListRange[];
}

export function createMessageListLayout(
	messages: readonly MessageType[],
): MessageListLayout {
	const rows: MessageListRow[] = [];
	const senderGroups: MessageListRange[] = [];

	for (const [index, message] of messages.entries()) {
		const previousRow = rows[index - 1];
		const date = new Date(message.date * 1000);
		const previousDate = previousRow
			? new Date(previousRow.message.date * 1000)
			: undefined;
		const isTimeSectionStart =
			!previousDate ||
			!isSameDay(date, previousDate) ||
			differenceInMinutes(date, previousDate) > 15;

		let senderGroupIndex: number | undefined;
		let isSenderGroupStart = false;
		if (message.from && isGroupableMessage(message)) {
			if (
				!isTimeSectionStart &&
				previousRow?.senderGroupIndex !== undefined &&
				previousRow.message.from.id === message.from.id
			) {
				senderGroupIndex = previousRow.senderGroupIndex;
				senderGroups[senderGroupIndex].endIndex = index + 1;
			} else {
				senderGroupIndex = senderGroups.length;
				isSenderGroupStart = true;
				senderGroups.push({ startIndex: index, endIndex: index + 1 });
			}
		}

		rows.push({
			message,
			isTimeSectionStart,
			isSenderGroupStart,
			senderGroupIndex,
		});
	}

	return { rows, senderGroups };
}

function isGroupableMessage(message: MessageType): boolean {
	if (message.type === MessageTypeEnum.APP) {
		const appType = message.message_entity.msg.appmsg.type;
		return (
			appType !== OpenMessageTypeEnum.PAT &&
			appType !== OpenMessageTypeEnum.RINGTONE
		);
	}
	return (
		message.type !== MessageTypeEnum.SYSTEM &&
		message.type !== MessageTypeEnum.SYSTEM_EXTENDED
	);
}
