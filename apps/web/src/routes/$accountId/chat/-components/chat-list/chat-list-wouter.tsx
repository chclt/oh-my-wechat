import { useState } from "react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { Route } from "../../route";
import ChatListWithContentSearch from "./chat-list-with-content-search";

export default function ChatListWouter() {
	const { accountId } = Route.useParams();

	return <ChatListMemoryWouter key={accountId} />;
}

function ChatListMemoryWouter() {
	const [location] = useState(() => memoryLocation({ path: "/" }));

	return (
		<Router hook={location.hook} searchHook={location.searchHook}>
			<ChatListWithContentSearch />
		</Router>
	);
}
