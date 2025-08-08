import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$accountId/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  return null;
}
