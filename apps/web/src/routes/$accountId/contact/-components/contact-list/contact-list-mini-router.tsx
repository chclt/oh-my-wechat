import { MiniRouter } from "@/components/mini-router";
import { useMemo } from "react";
import { Route } from "../../../route";
import ContactGroupList from "./contact-group-list";
import ContactList, { ContactListMiniRouteState } from "./contact-list";
import GreetingMessageList from "@/routes/$accountId/contact/-components/contact-list/greeting-message-list.tsx";

export default function ContactListMiniRouter() {
	const { accountId } = Route.useParams();

	const miniRoutes = {
		root: {
			name: "root",
			routeComponent: <ContactList />,
		},
		contactGroupList: {
			name: "contactGroupList",
			routeComponent: <ContactGroupList />,
		},
		greetingMessageList: {
			name: "greetingMessageList",
			routeComponent: <GreetingMessageList />,
		},
	};

	// Mini Router compare states with Object.is, so we need to use useMemo to ensure the default state is the same object reference
	const defaultState = useMemo(() => {
		return {
			name: "root",
			data: {
				accountId,
			},
		} satisfies ContactListMiniRouteState;
	}, [accountId]);

	return <MiniRouter routes={miniRoutes} defaultState={[defaultState]} />;
}
