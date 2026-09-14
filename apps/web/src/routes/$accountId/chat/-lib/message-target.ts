import type { HistoryState } from "@tanstack/react-router";
import { parseOptionalString } from "@/lib/utils";

declare module "@tanstack/react-router" {
	interface HistoryState {
		messagePositionRequestId?: string;
	}
}

export function requestMessagePosition(state: HistoryState): HistoryState {
	return { ...state, messagePositionRequestId: crypto.randomUUID() };
}

export interface MessageTargetSearch {
	messageLocalId?: string;
}

export interface MessageListTarget {
	messageLocalId: string;
}

export function parseMessageTargetSearch(
	search: Record<string, unknown>,
): MessageTargetSearch {
	return {
		messageLocalId: parseOptionalString(search.messageLocalId),
	};
}

export function getMessageTarget(
	search: MessageTargetSearch,
): MessageListTarget | undefined {
	if (search.messageLocalId === undefined) return undefined;
	return {
		messageLocalId: search.messageLocalId,
	};
}

export function getMessageTargetKey(
	target: MessageListTarget | undefined,
): string {
	return target ? JSON.stringify(target.messageLocalId) : "latest";
}

export function clearMessageTargetSearch<T extends MessageTargetSearch>(
	search: T,
) {
	return {
		...search,
		messageLocalId: undefined,
	};
}
