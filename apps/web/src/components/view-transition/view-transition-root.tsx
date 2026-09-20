import {
	Component,
	createContext,
	type ReactNode,
	useContext,
	useSyncExternalStore,
} from "react";
import { ViewTransitionController, type TransitionInput } from "./controller";
import type { ChangeDetails, Status } from "./types";

const Context = createContext<ViewTransitionController | null>(null);
const ActiveContext = createContext(false);

export interface ViewTransitionRootProps extends TransitionInput {
	children: ReactNode;
	/** Apply state changes immediately, without a preview. */
	disabled?: boolean;
	onStatusChange?: (status: Status, details: ChangeDetails) => void;
}

/** The small class boundary provides React's pre-mutation DOM snapshot lifecycle. */
export class ViewTransitionRoot extends Component<ViewTransitionRootProps> {
	private controller = new ViewTransitionController(this.props);
	getSnapshotBeforeUpdate(previous: ViewTransitionRootProps) {
		return previous.active !== this.props.active && !this.props.disabled
			? this.controller.prepare(this.props)
			: null;
	}
	componentDidMount() {
		this.controller.onStatusChange = this.props.onStatusChange;
	}
	componentDidUpdate(
		previous: ViewTransitionRootProps,
		_state: unknown,
		commit: (() => void) | null,
	) {
		this.controller.onStatusChange = this.props.onStatusChange;
		if (commit) commit();
		// Disabled changes and browsing commit directly without creating a motion.
		else if (
			previous.active !== this.props.active ||
			previous.from !== this.props.from ||
			previous.to !== this.props.to ||
			(this.props.disabled && !previous.disabled)
		)
			this.controller.select(this.props);
	}
	componentWillUnmount() {
		this.controller.dispose();
	}
	render() {
		return (
			<Context value={this.controller}>
				<ActiveContext value={this.props.active}>
					{this.props.children}
				</ActiveContext>
			</Context>
		);
	}
}

export function useViewTransitionController() {
	const controller = useContext(Context);
	if (!controller)
		throw new Error("ViewTransition parts must be inside ViewTransition.Root");
	return controller;
}

export function useViewTransition() {
	const controller = useViewTransitionController();
	const active = useContext(ActiveContext);
	const { store } = controller;
	const snapshot = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot,
	);
	// Child layout effects can run before Root commits the new active side.
	const status: Status =
		active !== snapshot.active
			? "preparing"
			: (snapshot.session?.status ?? "idle");
	return {
		active,
		status,
		transitions: snapshot.transitions,
		canTransition: controller.canTransition,
		getTarget: controller.getTarget,
	};
}

/** Refresh layout without subscribing an entire message list to animation phases. */
export function useViewTransitionActions(): Pick<
	ViewTransitionController,
	"refresh"
> {
	return useViewTransitionController();
}
