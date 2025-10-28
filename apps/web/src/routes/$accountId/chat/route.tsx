import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import ChatListMiniRouter from "./-components/chat-list/chat-list-mini-router";

export const Route = createFileRoute("/$accountId/chat")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ResizablePanelGroup
			direction="horizontal"
			className="min-h-screen max-h-screen items-stretch"
		>
			<ResizablePanel
				defaultSize={25}
				minSize={10}
				maxSize={80}
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
