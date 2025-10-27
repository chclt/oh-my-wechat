import { createContext, useContext } from "react";
import { useMiniRouter } from "./mini-router";
import { TMiniRouterState } from "./types";

interface MiniRouteContextProps extends TMiniRouterState {}

const MiniRouteContext = createContext<MiniRouteContextProps | null>(null);

export function useMiniRoute() {
	const context = useContext(MiniRouteContext);
	if (!context) {
		throw new Error("useMiniRoute must be used within a MiniRouteProvider");
	}
	return context;
}

export interface MiniRouteProps {
	state: TMiniRouterState;
}

export default function MiniRoute({ state }: MiniRouteProps) {
	const { routes } = useMiniRouter();
	const routeComponent = routes[state.name].routeComponent;

	return <MiniRouteContext value={state}>{routeComponent}</MiniRouteContext>;
}
