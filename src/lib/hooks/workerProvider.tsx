import type { WorkerResponse } from "@/lib/worker.ts";
import { createContext, useContext, useRef } from "react";

import AppWorker from "@/lib/worker.ts?worker";

interface WorkerProviderContext {
  worker: Worker;
  pendingQueries: Map<string, (response: any) => void>;
}

const WorkerContext = createContext<WorkerProviderContext | undefined>(
  undefined,
);

interface WorkerProviderProps {
  children: React.ReactNode;
}

export const WorkerProvider = ({ children }: WorkerProviderProps) => {
  const pendingQueries = useRef<Map<string, (response: any) => void>>(
    new Map(),
  );

  const workerRef = useRef<Worker>();
  if (!workerRef.current) {
    workerRef.current = new AppWorker();

    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, payload: response } = event.data;
      if (id && workerRef.current) {
        pendingQueries.current.get(id)?.(response);
        pendingQueries.current.delete(id);
      }
    };

    workerRef.current.onerror = (e) => {
      console.error("Worker error:", e);
    };
  }

  return (
    <WorkerContext.Provider
      value={{
        worker: workerRef.current,
        pendingQueries: pendingQueries.current,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error("useWorker must be used within a WorkerProvider");
  }
  return context;
};
