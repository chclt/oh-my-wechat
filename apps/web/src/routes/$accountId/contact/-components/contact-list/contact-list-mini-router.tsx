import { MiniRouter } from "@/components/mini-router";
import { useMemo } from "react";
import { Route } from "../../../route";
import ContactGroupList from "./contact-group-list";
import ContactList, { ContactListMiniRouteState } from "./contact-list";

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
