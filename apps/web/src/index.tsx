import queryClient from "@/lib/query-client.ts";
import * as Portal from "@radix-ui/react-portal";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import router from "./lib/router";

const rootEl = document.getElementById("root");
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	root.render(
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
			<Portal.Root container={document.body}>
				<TanStackDevtools
					config={{
						position: "bottom-left",
					}}
					plugins={[
						{
							name: "TanStack Query",
							render: <ReactQueryDevtoolsPanel client={queryClient} />,
						},
						{
							name: "TanStack Router",
							render: <TanStackRouterDevtoolsPanel router={router} />,
						},
					]}
				/>
			</Portal.Root>
		</React.StrictMode>,
	);
}
