import { readRect, toLocalRect } from "./geometry";

// Kept local until moveBefore is included in the project's DOM typings.
type MovableElement = HTMLElement & {
	moveBefore?: (node: Node, child: Node | null) => void;
};

/** React owns the portal's children; only this transport owns its container. */
export function createPreviewTransport(document: Document) {
	const element = document.createElement("div");
	element.dataset.viewTransitionFrame = "";
	Object.assign(element.style, {
		position: "absolute",
		left: "0px",
		top: "0px",
		margin: "0px",
		padding: "0px",
		border: "0px",
		boxSizing: "border-box",
		transformOrigin: "0 0",
		pointerEvents: "none",
		transition: "none",
	});
	let initialized = false;
	let width = 1;
	let height = 1;
	const canMove = () =>
		typeof (document.documentElement as MovableElement).moveBefore ===
		"function";
	const move = (parent: HTMLElement) => {
		if (element.parentElement === parent) return;
		if (parent.ownerDocument !== document || !parent.isConnected)
			throw new Error(
				"Preview container must be connected in the same document",
			);
		const rect = initialized ? readRect(element) : null;
		const local = rect ? toLocalRect(rect, parent) : null;
		if (element.isConnected && canMove())
			(parent as MovableElement).moveBefore!(element, null);
		else {
			if (rect)
				throw new Error(
					"An active Preview requires moveBefore to change containers",
				);
			parent.appendChild(element);
		}
		if (local) {
			// Rebase only the unanimated frame. The child's CSS coordinates and
			// running transitions survive; scrolling then follows the new parent.
			// Translation preserves subpixels that layout's left/top would round.
			element.style.translate = `${local.x}px ${local.y}px`;
			element.style.transform = `scale(${local.width / width}, ${local.height / height})`;
		}
	};
	return {
		element,
		get canMove() {
			return canMove();
		},
		place(parent: HTMLElement) {
			if (!initialized) {
				width = Math.max(parent.clientWidth, 1);
				height = Math.max(parent.clientHeight, 1);
				Object.assign(element.style, {
					left: "0px",
					top: "0px",
					translate: "none",
					transform: "none",
					width: `${width}px`,
					height: `${height}px`,
				});
			}
			move(parent);
			initialized = true;
		},
		park(parent: HTMLElement) {
			if (initialized && element.isConnected) move(parent);
		},
		reset() {
			initialized = false;
		},
	};
}
