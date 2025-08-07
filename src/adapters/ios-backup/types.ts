export interface ControllerPaginatorCursor {
	value: number;
	condition: "<" | "<=" | ">" | ">=" | "<>";
	[key: string]: any;
}
