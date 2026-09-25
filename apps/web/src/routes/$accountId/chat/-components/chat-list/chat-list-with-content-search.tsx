import { useDebouncedValue } from "@mantine/hooks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Redirect, Route as LocalRoute, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WouterFirstPageContentClassName } from "@/components/wouter/page";
import { ChatListSuspenseQueryOptions } from "@/lib/fetchers/chat";
import { cn } from "@/lib/utils.ts";
import { Route } from "../../route";
import { ContentSearch } from "../content-search";
import ChatGroupList from "./chat-group-list";
import ChatListItem from "./chat-item";
import useChatList from "./use-chat-list";

export default function ChatListWithContentSearch() {
	const { accountId } = Route.useParams();
	const [location] = useLocation();
	const isRootActive = location === "/";

	const { data } = useSuspenseQuery(ChatListSuspenseQueryOptions(accountId));

	const chatList = useChatList(data);
	return (
		<ContentSearch.Provider>
			<ChatListContent
				accountId={accountId}
				chatList={chatList}
				isRootActive={isRootActive}
			/>
		</ContentSearch.Provider>
	);
}

function ChatListContent({
	accountId,
	chatList,
	isRootActive,
}: {
	accountId: string;
	chatList: ReturnType<typeof useChatList>;
	isRootActive: boolean;
}) {
	const { isSearchEnabled, searchQuery } = ContentSearch.useContentSearch();
	const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
	const query = debouncedSearchQuery.trim();

	return (
		<div className={cn("absolute inset-0")}>
			<div className={cn("absolute inset-0", WouterFirstPageContentClassName)}>
				<div
					className="absolute inset-0 overflow-hidden"
					aria-hidden={!isRootActive}
					inert={!isRootActive}
					style={{
						pointerEvents: isRootActive ? "auto" : "none",
					}}
				>
					<ContentSearch.Input className="texture border-b border-bd" />

					<section
						className={cn(
							"absolute inset-0 transition duration-200 ease-out",
							isSearchEnabled
								? "-translate-x-[min(100%,20rem)] opacity-0"
								: "translate-x-0 opacity-100",
						)}
						aria-hidden={isSearchEnabled || !isRootActive}
						inert={isSearchEnabled || !isRootActive}
						style={{
							pointerEvents: isSearchEnabled || !isRootActive ? "none" : "auto",
						}}
					>
						<ScrollArea
							className="size-full"
							classNames={{
								// ScrollArea.Content 默认有 min-width: fit-content 的样式，本场景下未发现明显作用
								content: "pt-16 min-w-0!",
								scrollBar: "top-16! z-10",
							}}
						>
							<ul>
								{chatList.map((chatListItem) => (
									<ChatListItem
										key={chatListItem.id}
										chatListItem={chatListItem}
									/>
								))}
							</ul>
						</ScrollArea>
					</section>

					<section
						role="region"
						aria-label="搜索结果"
						className={cn(
							"absolute inset-0 transition duration-200 ease-out",
							isSearchEnabled
								? "translate-x-0 opacity-100"
								: "translate-x-[min(100%,20rem)] opacity-0",
						)}
						aria-hidden={!isSearchEnabled || !isRootActive}
						inert={!isSearchEnabled || !isRootActive}
						style={{
							pointerEvents: isSearchEnabled && isRootActive ? "auto" : "none",
						}}
					>
						<ScrollArea
							className="size-full"
							classNames={{ content: "pt-16", scrollBar: "top-16! z-10" }}
						>
							<ContentSearch.ResultPanel
								accountId={accountId}
								query={query}
								classNames={{
									searchGroupTitle: "top-16",
								}}
							/>
						</ScrollArea>
					</section>
				</div>
			</div>

			{/* Keep the root list mounted to preserve its scroll and search state. */}
			<LocalRoute path="/groups/:groupId">
				{({ groupId }) => {
					const group = chatList.find(
						(item) => item.type === "chatGroup" && item.id === groupId,
					);
					return group?.type === "chatGroup" ? (
						<Suspense key={group.id}>
							<ChatGroupList chatListItem={group} />
						</Suspense>
					) : (
						<Redirect to="/" replace />
					);
				}}
			</LocalRoute>
		</div>
	);
}
