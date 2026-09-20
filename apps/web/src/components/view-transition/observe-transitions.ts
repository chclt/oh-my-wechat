/** Read CSS-owned transitions; never create or control their playback. */
export function observeTransitions(
	element: HTMLElement,
	onComplete: () => void,
) {
	let revision = 0;
	const check = () => {
		const current = ++revision;
		// Read after the React commit so getAnimations sees the completed CSS update.
		queueMicrotask(() => {
			if (current !== revision) return;
			const transitions = element
				.getAnimations()
				.filter(
					(animation) =>
						animation instanceof CSSTransition &&
						(animation.pending || animation.playState !== "finished"),
				);
			if (!transitions.length) {
				dispose();
				onComplete();
				return;
			}
			const recheck = () => {
				if (current === revision) check();
			};
			// Cancellation may replace a transition. Inspect the browser's new
			// set instead of treating an interrupted property as completion.
			Promise.all(transitions.map((transition) => transition.finished)).then(
				recheck,
				recheck,
			);
		});
	};
	function dispose() {
		revision++;
	}
	return {
		dispose,
		beginUpdate: dispose,
		endUpdate: check,
	};
}
