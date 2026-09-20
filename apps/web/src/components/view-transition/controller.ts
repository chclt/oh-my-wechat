import { ViewTransitionMotion, type TransitionInput } from "./motion";
import { Store } from "./store";
import type { ChangeDetails, Endpoint, Status, TransitionState } from "./types";

export type { TransitionInput } from "./motion";
interface Snapshot {
	active: boolean;
	session: TransitionState | null;
	transitions: readonly TransitionState[];
}

/** Routes committed changes to their endpoint pair; unrelated motions finish independently. */
export class ViewTransitionController {
	readonly store: Store<Snapshot>;
	onStatusChange?: (status: Status, details: ChangeDetails) => void;
	private targets = new Map<
		string,
		{ element: HTMLElement; isReady?: (element: HTMLElement) => boolean }
	>();
	private motions: readonly ViewTransitionMotion[] = [];
	private sequence = 0;
	private current: TransitionInput;

	constructor(input: TransitionInput) {
		this.current = input;
		this.store = new Store<Snapshot>({
			active: input.active,
			session: null,
			transitions: [],
		});
	}

	getTarget = (key: string) => this.targets.get(key)?.element ?? null;
	private getReadyTarget = (key: string) => {
		const target = this.targets.get(key);
		return target && (target.isReady?.(target.element) ?? true)
			? target.element
			: null;
	};
	getMotions = () => this.motions;
	registerTarget(
		key: string,
		element: HTMLElement,
		isReady?: (element: HTMLElement) => boolean,
	) {
		const target = { element, isReady };
		this.targets.set(key, target);
		this.refresh();
		return () => {
			if (this.targets.get(key) !== target) return;
			this.targets.delete(key);
			this.refresh();
		};
	}

	private find(from: Endpoint | null, to: Endpoint | null) {
		return this.motions.find((motion) => {
			const pair = motion.store.getSnapshot();
			return (
				pair &&
				((pair.from === from && pair.to === to) ||
					(pair.from === to && pair.to === from))
			);
		});
	}

	canTransition = (from: Endpoint | null, to: Endpoint | null) => {
		const motion = this.find(from, to);
		return !motion || motion.canInterrupt;
	};
	prepare(input: TransitionInput) {
		const id = ++this.sequence;
		const motion =
			this.find(input.from, input.to) ??
			new ViewTransitionMotion(id, this.getReadyTarget);
		const commit = motion.prepare(input, id);
		return () => {
			this.current = input;
			if (!this.motions.includes(motion)) {
				this.motions = [...this.motions, motion];
				// Share participation changes, but keep geometry updates in the motion.
				motion.onChange = (status, session, reason) => {
					const previous = this.store
						.getSnapshot()
						.transitions.find(({ id }) => id === session.id);
					if (status === "idle")
						this.motions = this.motions.filter((item) => item !== motion);
					this.publish();
					if (status !== previous?.status)
						this.onStatusChange?.(status, { transition: session, reason });
				};
			}
			commit();
		};
	}

	/** Commit the current state without requesting an open/close animation. */
	select(input: TransitionInput) {
		const previous = this.find(this.current.from, this.current.to);
		this.current = input;
		previous?.cancel();
		this.publish();
	}

	refresh = () => this.motions.forEach((motion) => motion.refresh());
	dispose() {
		this.motions.forEach((motion) => motion.cancel());
	}

	private publish() {
		this.store.set({
			active: this.current.active,
			session:
				this.find(this.current.from, this.current.to)?.store.getSnapshot() ??
				null,
			transitions: this.motions.map((motion) => motion.store.getSnapshot()!),
		});
	}
}
