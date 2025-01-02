import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProvider } from "@/lib/hooks/appProvider.tsx";
import { DatabaseProvider } from "@/lib/hooks/databaseProvider";
import { WorkerProvider } from "@/lib/hooks/workerProvider.tsx";
import { ErrorBoundary } from "react-error-boundary";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <ErrorBoundary
          fallback={
            typeof Worker === "undefined" && (
              <p>你的浏览器不支持 Web Worker，请检查浏览器版本或浏览器设置</p>
            )
          }
        >
          <WorkerProvider>
            <DatabaseProvider>
              <App />
            </DatabaseProvider>
          </WorkerProvider>
        </ErrorBoundary>
      </AppProvider>
    </React.StrictMode>,
  );
}
