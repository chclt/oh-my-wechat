import type { DataAdapter } from "@/adapters/adapter";

let adapter: DataAdapter | undefined;

const getDataAdapter = () => {
  if (!adapter) {
    throw new Error("Data adapter not set");
  }
  return adapter;
};

const setDataAdapter = (newAdapter: DataAdapter) => {
  adapter = newAdapter;
};

export { getDataAdapter, setDataAdapter };
