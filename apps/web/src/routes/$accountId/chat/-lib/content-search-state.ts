import { parseOptionalBoolean, parseOptionalString } from "@/lib/utils";

declare module "@tanstack/react-router" {
	interface HistoryState {
		contentSearchFocusRequestId?: string;
	}
}

export interface ChatRouteSearchParams {
	search?: boolean;
	searchQuery?: string;
	searchFromChat?: string;
	searchFromUser?: string;
	searchStartTime?: string;
	searchEndTime?: string;
}

export function parseContentSearchParams(
	search: Partial<Record<keyof ChatRouteSearchParams, unknown>>,
): ChatRouteSearchParams {
	return {
		search: parseOptionalBoolean(search.search),
		searchQuery: parseOptionalString(search.searchQuery),
		searchFromChat: parseOptionalString(search.searchFromChat),
		searchFromUser: parseOptionalString(search.searchFromUser),
		searchStartTime: parseOptionalString(search.searchStartTime),
		searchEndTime: parseOptionalString(search.searchEndTime),
	};
}

export function selectContentSearchState(search: ChatRouteSearchParams) {
	return {
		isSearchEnabled: search.search === true,
		searchQuery: search.searchQuery ?? "",
		searchFromChat: search.searchFromChat ?? "",
		searchFromUser: search.searchFromUser ?? "",
		searchStartTime: search.searchStartTime ?? "",
		searchEndTime: search.searchEndTime ?? "",
	};
}

export function updateContentSearchParams<T extends ChatRouteSearchParams>(
	previous: T,
	patch: ChatRouteSearchParams,
) {
	const next = { ...previous, ...patch };
	if (Object.hasOwn(patch, "searchFromChat")) {
		next.searchFromUser = undefined;
	}
	return next;
}

export function clearContentSearchParams<T extends ChatRouteSearchParams>(
	previous: T,
) {
	return {
		...previous,
		search: undefined,
		searchQuery: undefined,
		searchFromChat: undefined,
		searchFromUser: undefined,
		searchStartTime: undefined,
		searchEndTime: undefined,
	};
}
