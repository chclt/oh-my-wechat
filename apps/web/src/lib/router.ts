import { routeTree } from "@/routeTree.gen";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";

const memoryHistory = createMemoryHistory({
	initialEntries: ["/"],
});

const router = createRouter({ routeTree, history: memoryHistory });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export default router;
