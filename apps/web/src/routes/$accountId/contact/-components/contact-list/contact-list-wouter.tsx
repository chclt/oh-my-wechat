import { Suspense, useState } from "react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { Route } from "../../../route";
import ContactList from "./contact-list";

export default function ContactListWouter() {
	const { accountId } = Route.useParams();

	return <ContactListMemoryWouter key={accountId} />;
}

function ContactListMemoryWouter() {
	const [location] = useState(() => memoryLocation({ path: "/" }));

	return (
		<Router hook={location.hook} searchHook={location.searchHook}>
			<Suspense>
				<ContactList />
			</Suspense>
		</Router>
	);
}
