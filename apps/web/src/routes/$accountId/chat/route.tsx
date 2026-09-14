import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatListMiniRouter from "./-components/chat-list/mini-router";
import { useContentSearchHotkey } from "./-components/content-search/use-content-search-hotkey";
import { parseContentSearchParams } from "./-lib/content-search-state";

export const Route = createFileRoute("/$accountId/chat")({
	validateSearch: parseContentSearchParams,
	component: RouteComponent,
});

function RouteComponent() {
	const { search: isSearchMode } = Route.useSearch();
	useContentSearchHotkey();

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
