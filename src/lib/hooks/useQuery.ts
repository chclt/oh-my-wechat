import type { WorkerRequest, WorkerRequestQuery } from "@/lib/worker.ts";

import _global from "@/lib/global.ts";
import { useWorker } from "@/lib/hooks/workerProvider.tsx";
import { useCallback, useState } from "react";

export function useCommand<Request extends WorkerRequest, Response>(
  initialState: Response,
): [
  (type: Request["type"], payload: Request["payload"]) => Promise<Response>,
  boolean,
  Response,
  unknown,
] {
  const { worker, pendingQueries } = useWorker();

  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [result, setResult] = useState<Response>(initialState);
  const [error, setError] = useState(null);

  const query = useCallback(
    async (type: Request["type"], payload: Request["payload"]) => {
      setIsQuerying(true);
      const id = crypto.randomUUID();

      return new Promise<Response>((resolve, reject) => {
        pendingQueries.set(id, (response) => {
          setIsQuerying(false);

          if (_global.enableDebug) {
            console.groupCollapsed(`command ${type}`);
            console.log(payload);
            console.log(response);
            console.groupEnd();
          }

          setResult(response);
          setError(null);
          resolve(response);
        });

        worker.postMessage({ id, type, payload } as WorkerRequest<
          Request["type"],
          Request["payload"]
        >);
      });
    },
    [],
  );

  return [query, isQuerying, result, error];
}

export default function useQuery<Response>(
  initialState: Response,
): [
  (endpoint: string, ...args: unknown[]) => Promise<Response>,
  boolean,
  Response,
  unknown,
] {
  const { worker, pendingQueries } = useWorker();

  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [result, setResult] = useState<Response>(initialState);
  const [error, setError] = useState(null);

  const query = useCallback(async (endpoint: string, ...args: unknown[]) => {
    setIsQuerying(true);
    const id = crypto.randomUUID();

    return new Promise<Response>((resolve, reject) => {
      pendingQueries.set(id, (response) => {
        setIsQuerying(false);

        if (_global.enableDebug) {
          console.groupCollapsed(`query ${endpoint}`);
          console.log(...args);
          console.log(response);
          console.groupEnd();
        }

        setResult(response);
        setError(null);
        resolve(response);
      });

      worker.postMessage({
        id,
        type: "query",
        payload: [endpoint, ...args],
      } as WorkerRequestQuery);
    });
  }, []);

  return [query, isQuerying, result, error];
}
