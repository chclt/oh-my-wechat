import { useMemo } from "react";
import { MiniRouter } from "@/components/mini-router";
import { Route } from "../../route";
import ChatGroupList from "./chat-group-list";
import ChatListWithContentSearch, {
	ChatListMiniRouteState,
} from "./chat-list-with-content-search";

export default function ChatListMiniRouter() {
	const { accountId } = Route.useParams();

	const miniRoutes = {
		root: {
			name: "root",
			routeComponent: <ChatListWithContentSearch />,
		},
		chatGroupList: {
			name: "chatGroupList",
			routeComponent: <ChatGroupList />,
		},
	};

	// Mini Router compare states with Object.is, so we need to use useMemo to ensure the default state is the same object reference
	const defaultState = useMemo(() => {
		return {
			name: "root",
			data: {
				accountId,
			},
		} satisfies ChatListMiniRouteState;
	}, [accountId]);

	return <MiniRouter routes={miniRoutes} defaultState={[defaultState]} />;
}
