import { createContext, useContext, type ReactNode } from "react";
import { useContentSearchRoute } from "./use-content-search-route";

type ContentSearchContextValue = ReturnType<typeof useContentSearchRoute>;

const ContentSearchContext = createContext<ContentSearchContextValue | null>(
	null,
);

export function ContentSearchProvider({ children }: { children: ReactNode }) {
	const value = useContentSearchRoute();

	return <ContentSearchContext value={value}>{children}</ContentSearchContext>;
}

export function useContentSearch() {
	return useContext(ContentSearchContext)!;
}
