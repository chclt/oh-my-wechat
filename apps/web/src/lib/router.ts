import {
	createMemoryHistory,
	createRouteMask,
	createRouter,
} from "@tanstack/react-router";
import { AccountSearchModalOptions } from "@/routes/$accountId/-types.ts";
import { routeTree } from "@/routeTree.gen";

const memoryHistory = createMemoryHistory({
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
	...(import.meta.env.DEV ? {} : { history: memoryHistory }),
	routeMasks: [
		accountContactModalToAccountRootMask,
		...(import.meta.env.DEV ? [] : chatSearchMasks),
	],
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export default router;
