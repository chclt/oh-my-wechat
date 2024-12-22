import { useApp } from "@/lib/hooks/appProvider.tsx";
import { useCommand } from "@/lib/hooks/useQuery.ts";
import type { User, WCDatabases } from "@/lib/schema.ts";
import type {
  WorkerRequestLoadDatabases,
  WorkerRequestLoadDirectory,
  WorkerResponseLoadDatabases,
  WorkerResponseLoadDirectory,
} from "@/lib/worker.ts";
import { createContext, useContext, useEffect, useState } from "react";

const DatabaseContext = createContext<{
  loadDirectory: (
    directory: WorkerRequestLoadDirectory["payload"]["directory"],
  ) => Promise<void>;
  directory:
    | WorkerResponseLoadDirectory["payload"]["data"]["directory"]
    | undefined;
  accountList: User[];
  loadDatabases: (account: User) => Promise<void>;
  databases: WCDatabases | undefined;
}>({
  loadDirectory: () => Promise.resolve(),
  directory: undefined,
  accountList: [],
  loadDatabases: () => Promise.resolve(),
  databases: undefined,
});

export const DatabaseProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const { setUser } = useApp();
  const [accountList, setAccountList] = useState<User[]>([]);

  // load directory
  const [directory, setDirectory] =
    useState<WorkerResponseLoadDirectory["payload"]["data"]["directory"]>();
  const [
    _loadDirectory,
    isLoadingDirectory,
    loadDirectoryResult,
    loadDirectoryError,
  ] = useCommand<
    WorkerRequestLoadDirectory,
    WorkerResponseLoadDirectory["payload"] | undefined
  >(undefined);
  const loadDirectory = async (
    directory: WorkerResponseLoadDirectory["payload"]["data"]["directory"],
  ) => {
    await _loadDirectory("load_directory", { directory });
  };
  useEffect(() => {
    if (loadDirectoryResult) {
      setDirectory(loadDirectoryResult.data.directory);
      setAccountList(loadDirectoryResult.data.accounts);
    }
  }, [loadDirectoryResult]);

  // load databases
  const [databases, setDatabases] = useState<WCDatabases>();
  const [
    _loadDatabases,
    isLoadingDatabases,
    loadDatabasesResult,
    loadDatabasesError,
  ] = useCommand<
    WorkerRequestLoadDatabases,
    WorkerResponseLoadDatabases["payload"] | undefined
  >(undefined);
  const loadDatabases = async (account: User) => {
    await _loadDatabases("load_databases", { account });
    // setUser(account);
  };
  useEffect(() => {
    if (loadDatabasesResult) {
      setDatabases(loadDatabasesResult.data.databases);
      setUser(loadDatabasesResult.data.account);
    }
  }, [loadDatabasesResult]);

  return (
    <DatabaseContext.Provider
      value={{
        directory,
        loadDirectory,
        loadDatabases,
        databases,
        accountList,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};
