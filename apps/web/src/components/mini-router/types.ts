export type TMiniRouteName = string;

export interface TMiniRoute {
	name: TMiniRouteName;
	routeComponent: React.ReactNode;
}

export interface TMiniRouterState {
	name: TMiniRouteName;
	data: unknown;
}
