import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$accountId/chat/$chatId/info")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/$accountId/chat/$chatId/info"!</div>;
}
