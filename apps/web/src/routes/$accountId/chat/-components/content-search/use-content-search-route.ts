import { useMatchRoute, useNavigate, useSearch } from "@tanstack/react-router";
import {
	clearContentSearchParams,
	selectContentSearchState,
	updateContentSearchParams,
	type ChatRouteSearchParams,
} from "../../-lib/content-search-state";

export function useOpenContentSearch() {
	const navigate = useNavigate();
	const matchRoute = useMatchRoute();

	return ({ focus = false }: { focus?: boolean } = {}) => {
		const chat = matchRoute({
			to: "/$accountId/chat/$chatId",
			fuzzy: true,
		});
		const searchFromChat = chat ? chat.chatId : undefined;

		void navigate({
			to: ".",
			search: (previous) =>
				updateContentSearchParams(previous, {
					search: true,
					...(previous.searchFromChat !== searchFromChat
						? { searchFromChat }
						: {}),
				}),
			state: (previous) => ({
				...previous,
				...(focus ? { contentSearchFocusRequestId: crypto.randomUUID() } : {}),
			}),
			replace: true,
		});
	};
}

export function useContentSearchRoute() {
	const state = useSearch({
		from: "/$accountId/chat",
		select: selectContentSearchState,
		structuralSharing: true,
	});
	// Read the parent's typed search state, but update the current child location.
	const navigate = useNavigate();
	const openSearch = useOpenContentSearch();
	const update = (patch: ChatRouteSearchParams) => {
		void navigate({
			to: ".",
			search: (previous) => updateContentSearchParams(previous, patch),
			replace: true,
		});
	};

	return {
		...state,
		openSearch,
		closeSearch: () => {
			void navigate({
				to: ".",
				search: clearContentSearchParams,
				replace: true,
			});
		},
		setSearchQuery: (searchQuery: string) => update({ searchQuery }),
		setSearchFromChat: (searchFromChat: string | undefined) =>
			update({ searchFromChat }),
		setSearchFromUser: (searchFromUser: string) => update({ searchFromUser }),
		setSearchStartTime: (searchStartTime: string) =>
			update({ searchStartTime }),
		setSearchEndTime: (searchEndTime: string) => update({ searchEndTime }),
	};
}
