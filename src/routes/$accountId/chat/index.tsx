import Wrapped2024Trigger from "@/wrapped-2024/components/wrapped-2024-trigger";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$accountId/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Wrapped2024Trigger />;
}
