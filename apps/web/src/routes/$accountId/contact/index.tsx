import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AccountSearchModalOptions } from "../route";

export const Route = createFileRoute("/$accountId/contact/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { accountId } = Route.useParams();

	return (
		<Navigate
			to="/$accountId/chat"
			params={{
				accountId,
			}}
			search={{ modal: AccountSearchModalOptions.CONTACT }}
			replace={true}
			mask={{
				to: "/$accountId/contact",
				params: {
					accountId,
				},
			}}
		/>
	);
}
