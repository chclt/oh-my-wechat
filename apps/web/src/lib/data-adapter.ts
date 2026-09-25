import type { DataAdapter } from "@repo/types/adapter";
import queryClient from "./query-client";

let dataAdapter: DataAdapter | undefined;

const hasDataAdapter = () => dataAdapter !== undefined;

const getDataAdapter = () => {
	if (!dataAdapter) {
		throw new Error("Data adapter not set");
	}
	return dataAdapter;
};

const setDataAdapter = (newAdapter: DataAdapter) => {
	if (dataAdapter === newAdapter) return;

	queryClient.removeQueries();
	dataAdapter = newAdapter;
};

export { getDataAdapter, hasDataAdapter, setDataAdapter };
