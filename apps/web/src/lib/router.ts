import {
	createMemoryHistory,
	createRouteMask,
	createRouter,
} from "@tanstack/react-router";
import { isTauri } from "@/lib/platform";
import { AccountSearchModalOptions } from "@/routes/$accountId/-types.ts";
import { routeTree } from "@/routeTree.gen";

const isBrowserHistoryEnabled = isTauri || import.meta.env.DEV;

const memoryHistory = isBrowserHistoryEnabled
	? undefined
	: createMemoryHistory({
			initialEntries: ["/"],
		});

const accountContactModalToAccountRootMask = createRouteMask({
	routeTree,
	from: "/$accountId/contact",
	to: "/$accountId",
	params: (prev) => {
		return {
			accountId: prev.accountId,
		};
	},
	search: {
		modal: AccountSearchModalOptions.CONTACT,
	},
});

const chatSearchMasks = (
	[
		"/$accountId/chat",
		"/$accountId/chat/$chatId",
		"/$accountId/chat/$chatId/info",
	] as const
).map((path) =>
	createRouteMask({
		routeTree,
		from: path,
		to: path,
		search: {},
	}),
);

const router = createRouter({
	routeTree,
	...(isBrowserHistoryEnabled ? {} : { history: memoryHistory }),
	routeMasks: [
		accountContactModalToAccountRootMask,
		...(isBrowserHistoryEnabled ? [] : chatSearchMasks),
	],
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export default router;
