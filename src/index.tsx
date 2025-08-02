import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProvider } from "@/lib/hooks/appProvider.tsx";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/query-client.ts";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ErrorBoundary
            fallback={
              typeof Worker === "undefined" && (
                <p>你的浏览器不支持 Web Worker，请检查浏览器版本或浏览器设置</p>
              )
            }
          >
            <App />
          </ErrorBoundary>
        </AppProvider>
        <ReactQueryDevtools buttonPosition="bottom-left" />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
