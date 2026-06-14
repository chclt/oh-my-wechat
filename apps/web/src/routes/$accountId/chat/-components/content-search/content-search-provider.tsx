import { useNavigate, useSearch } from "@tanstack/react-router";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ChatRouteSearchParams } from "../../route";

interface ContentSearchContextValue {
	isSearchEnabled: boolean;
	searchQuery: string;
	setSearchQuery: (searchQuery: string) => void;
	searchFromChat: string;
	setSearchFromChat: (searchFromChat: string) => void;
	searchFromUser: string;
	setSearchFromUser: (searchFromUser: string) => void;
	searchStartTime: string;
	setSearchStartTime: (searchStartTime: string) => void;
	searchEndTime: string;
	setSearchEndTime: (searchEndTime: string) => void;
	openSearch: () => void;
	closeSearch: () => void;
}

const ContentSearchContext = createContext<ContentSearchContextValue | null>(
	null,
);

export function ContentSearchProvider({ children }: { children: ReactNode }) {
	const search = useSearch({ from: "/$accountId/chat" });
	const navigate = useNavigate({ from: "/$accountId/chat" });

	const updateSearch = (nextSearch: Partial<ChatRouteSearchParams>) => {
		void navigate({
			search: (previousSearch) => ({
				...previousSearch,
				...nextSearch,
			}),
			replace: true,
		});
	};

	// TODO
	const setOptionalStringSearch = (
		key: keyof Pick<
			ChatRouteSearchParams,
			| "searchQuery"
			| "searchFromChat"
			| "searchFromUser"
			| "searchStartTime"
			| "searchEndTime"
		>,
		value: string,
	) => {
		updateSearch({
			[key]: value.trim().length > 0 ? value : undefined,
		});
	};

	return (
		<ContentSearchContext
			value={{
				isSearchEnabled: search.search === true,
				searchQuery: search.searchQuery ?? "",
				setSearchQuery: (searchQuery) => {
					setOptionalStringSearch("searchQuery", searchQuery);
				},
				searchFromChat: search.searchFromChat ?? "",
				setSearchFromChat: (searchFromChat) => {
					updateSearch({
						searchFromChat:
							searchFromChat.trim().length > 0 ? searchFromChat : undefined,
						searchFromUser: undefined,
					});
				},
				searchFromUser: search.searchFromUser ?? "",
				setSearchFromUser: (searchFromUser) => {
					setOptionalStringSearch("searchFromUser", searchFromUser);
				},
				searchStartTime: search.searchStartTime ?? "",
				setSearchStartTime: (searchStartTime) => {
					setOptionalStringSearch("searchStartTime", searchStartTime);
				},
				searchEndTime: search.searchEndTime ?? "",
				setSearchEndTime: (searchEndTime) => {
					setOptionalStringSearch("searchEndTime", searchEndTime);
				},
				openSearch: () => {
					updateSearch({ search: true });
				},
				closeSearch: () => {
					updateSearch({
						search: undefined,
						searchQuery: undefined,
						searchFromChat: undefined,
						searchFromUser: undefined,
						searchStartTime: undefined,
						searchEndTime: undefined,
					});
				},
			}}
		>
			{children}
		</ContentSearchContext>
	);
}

export function useContentSearch() {
	const context = useContext(ContentSearchContext);
	if (!context) {
		throw new Error(
			"ContentSearch components must be used within ContentSearchProvider.",
		);
	}
	return context;
}
