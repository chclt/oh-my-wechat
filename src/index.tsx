import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProvider } from "@/lib/hooks/appProvider.tsx";
import { DatabaseProvider } from "@/lib/hooks/databaseProvider";
import { WorkerProvider } from "@/lib/hooks/workerProvider.tsx";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <AppProvider enableDebug={true}>
        <WorkerProvider>
          <DatabaseProvider>
            <App />
          </DatabaseProvider>
        </WorkerProvider>
      </AppProvider>
    </React.StrictMode>,
  );
}
