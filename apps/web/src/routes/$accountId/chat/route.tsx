import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { parseOptionalBoolean, parseOptionalString } from "@/lib/utils";
import ChatListMiniRouter from "./-components/chat-list/mini-router";

export interface ChatRouteSearchParams {
	search?: boolean;
	searchQuery?: string;
	searchFromChat?: string;
	searchFromUser?: string;
	searchStartTime?: string;
	searchEndTime?: string;
}

export const Route = createFileRoute("/$accountId/chat")({
	validateSearch: (search): ChatRouteSearchParams => ({
		search: parseOptionalBoolean(search.search),
		searchQuery: parseOptionalString(search.searchQuery),
		searchFromChat: parseOptionalString(search.searchFromChat),
		searchFromUser: parseOptionalString(search.searchFromUser),
		searchStartTime: parseOptionalString(search.searchStartTime),
		searchEndTime: parseOptionalString(search.searchEndTime),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { search: isSearchMode } = Route.useSearch();

	return (
		<ResizablePanelGroup
			orientation="horizontal"
			className="min-h-screen max-h-screen items-stretch"
		>
			<ResizablePanel
				defaultSize="25%"
				minSize={isSearchMode ? 240 : 68}
				maxSize={480}
				groupResizeBehavior="preserve-pixel-size"
				className="flex"
			>
				<Suspense>
					<div className={"relative w-full h-full"}>
						<ChatListMiniRouter />
					</div>
				</Suspense>
			</ResizablePanel>

			<ResizableHandle />

			<ResizablePanel>
				<Suspense>
					<div className={"relative w-full h-full"}>
						<div className={"absolute inset-0"}>
							<Outlet />
						</div>
					</div>
				</Suspense>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
