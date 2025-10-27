import MiniRoute, { useMiniRoute } from "./mini-route";
import { useMiniRouter } from "./mini-router";

export function MiniOutlet() {
	const { states } = useMiniRouter();
	const thisRouteState = useMiniRoute();
	const thisRoutePosition = states.findIndex((state) =>
		Object.is(state, thisRouteState),
	);

	const nextRouteState = states[thisRoutePosition + 1];

	if (!nextRouteState) {
		return null;
	}

	return <MiniRoute state={nextRouteState} />;
}
