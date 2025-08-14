import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/$accountId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { accountId } = Route.useParams();

	return <Navigate to="/$accountId/chat" params={{ accountId }} />;
}
