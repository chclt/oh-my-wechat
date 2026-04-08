import type { DataAdapter } from "@repo/types/adapter";

let dataAdapter: DataAdapter | undefined;

const getDataAdapter = () => {
	if (!dataAdapter) {
		throw new Error("Data adapter not set");
	}
	return dataAdapter;
};

const setDataAdapter = (newAdapter: DataAdapter) => {
	dataAdapter = newAdapter;
};

export { getDataAdapter, setDataAdapter };
