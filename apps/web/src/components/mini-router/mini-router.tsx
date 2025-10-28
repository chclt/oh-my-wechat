import { createContext, Suspense, useContext, useState } from "react";
import MiniRoute from "./mini-route";
import { TMiniRoute, TMiniRouteName, TMiniRouterState } from "./types";

interface MiniRouterContextProps {
	routes: Record<TMiniRouteName, TMiniRoute>;
	states: TMiniRouterState[];
	back: () => void;
	pushState: (state: TMiniRouterState) => void;
}

const MiniRouterContext = createContext<MiniRouterContextProps | null>(null);

export function useMiniRouter() {
	const context = useContext(MiniRouterContext);
	if (!context) {
		throw new Error("useMiniRouter must be used within a MiniRouterProvider");
	}
	return context;
}

interface MiniRouterProps {
	routes: Record<TMiniRouteName, TMiniRoute>;
	defaultState: TMiniRouterState[];
}

export function MiniRouter({ routes, defaultState }: MiniRouterProps) {
	const [states, setStates] = useState<TMiniRouterState[]>(defaultState);
	const back = () => {
		setStates((prev) => prev.slice(0, -1));
	};
	const pushState = (state: TMiniRouterState) => {
		setStates((prev) => [...prev, state]);
	};

	return (
		<MiniRouterContext.Provider
			value={{
				routes,
				states,
				back,
				pushState,
			}}
		>
			{defaultState[0] && (
				<Suspense>
					<MiniRoute state={defaultState[0]} />
				</Suspense>
			)}
		</MiniRouterContext.Provider>
	);
}
