import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AppProvider } from "@/lib/hooks/appProvider.tsx";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/query-client.ts";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { RouterProvider } from "@tanstack/react-router";
import router from "./lib/router";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <TanStackRouterDevtools router={router} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
