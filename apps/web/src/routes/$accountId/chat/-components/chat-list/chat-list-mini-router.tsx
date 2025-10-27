import { MiniRouter } from "@/components/mini-router";
import { useMemo } from "react";
import { Route } from "../../route";
import ChatGroupList from "./chat-group-list";
import ChatList, { ChatListMiniRouteState } from "./chat-list";

export default function ChatListMiniRouter() {
	const { accountId } = Route.useParams();

	const miniRoutes = {
		root: {
			name: "root",
			routeComponent: <ChatList />,
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
