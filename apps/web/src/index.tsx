import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import queryClient from "@/lib/query-client.ts";
import router from "./lib/router";

const rootEl = document.getElementById("root");
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	const Devtools = import.meta.env.DEV
		? (await import("./components/Devtools")).default
		: () => null;
	root.render(
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>

			<Devtools />
		</React.StrictMode>,
	);
}
