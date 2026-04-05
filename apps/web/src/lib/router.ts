import { routeTree } from "@/routeTree.gen";
import {
	createMemoryHistory,
	createRouteMask,
	createRouter,
} from "@tanstack/react-router";

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
		modal: "contact",
	},
});

const router = createRouter({
	routeTree,
	history: memoryHistory,
	routeMasks: [accountContactModalToAccountRootMask],
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export default router;
