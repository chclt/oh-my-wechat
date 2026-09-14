import { ChatSearchResults } from "./chat-search-results.tsx";
import { useContentSearch } from "./content-search-provider.tsx";
import { MessageSearchResults } from "./message-search-results.tsx";

interface ContentSearchResultPanelProps {
	accountId: string;
	query: string;
	classNames?: { searchGroupTitle?: string };
}

export function ContentSearchResultPanel({
	accountId,
	query,
	classNames,
}: ContentSearchResultPanelProps) {
	const { searchFromChat, searchFromUser, searchStartTime, searchEndTime } =
		useContentSearch();

	return (
		<div>
			<ChatSearchResults
				accountId={accountId}
				query={query}
				titleClassName={classNames?.searchGroupTitle}
			/>
			<MessageSearchResults
				request={{
					account: { id: accountId },
					searchText: query,
					chat: searchFromChat ? { id: searchFromChat } : undefined,
					user: searchFromUser ? { id: searchFromUser } : undefined,
					startTime: searchStartTime || undefined,
					endTime: searchEndTime || undefined,
				}}
				titleClassName={classNames?.searchGroupTitle}
			/>
		</div>
	);
}
