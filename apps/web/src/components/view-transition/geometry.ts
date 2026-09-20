import type { Rect } from "./types";

export function sameRect(a: Rect | null, b: Rect) {
	return (
		!!a &&
		a.x === b.x &&
		a.y === b.y &&
		a.width === b.width &&
		a.height === b.height
	);
}

/** Retain authored endpoints exactly so subpixel noise does not restart native reversals. */
export function retainRect(previous: Rect, next: Rect): Rect {
	const retain = (a: number, b: number) => (Math.abs(a - b) < 0.1 ? a : b);
	return {
		x: retain(previous.x, next.x),
		y: retain(previous.y, next.y),
		width: retain(previous.width, next.width),
		height: retain(previous.height, next.height),
	};
}

export function readRect(element: HTMLElement): Rect | null {
	if (!element.isConnected || !element.getClientRects().length) return null;
	const rect = element.getBoundingClientRect();
	if (rect.width <= 0 || rect.height <= 0) return null;
	return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
}

/** Ignore targets outside the viewport or a scrolling/clipping ancestor. */
export function readVisibleRect(element: HTMLElement): Rect | null {
	const rect = readRect(element);
	const win = element.ownerDocument.defaultView;
	if (!rect || !win) return null;
	let left = Math.max(rect.x, 0);
	let top = Math.max(rect.y, 0);
	let right = Math.min(rect.x + rect.width, win.innerWidth);
	let bottom = Math.min(rect.y + rect.height, win.innerHeight);
	for (
		let parent = element.parentElement;
		parent;
		parent = parent.parentElement
	) {
		const style = win.getComputedStyle(parent);
		const bounds = parent.getBoundingClientRect();
		const { x: scaleX, y: scaleY } = readScale(bounds, style);
		if (/auto|scroll|hidden|clip/.test(style.overflowX)) {
			left = Math.max(left, bounds.left + parent.clientLeft * scaleX);
			right = Math.min(
				right,
				bounds.left + (parent.clientLeft + parent.clientWidth) * scaleX,
			);
		}
		if (/auto|scroll|hidden|clip/.test(style.overflowY)) {
			top = Math.max(top, bounds.top + parent.clientTop * scaleY);
			bottom = Math.min(
				bottom,
				bounds.top + (parent.clientTop + parent.clientHeight) * scaleY,
			);
		}
	}
	return right > left && bottom > top ? rect : null;
}

/** Convert an estimated content rectangle back to viewport coordinates. */
export function toViewportRect(rect: Rect, parent: HTMLElement): Rect {
	const bounds = parent.getBoundingClientRect();
	const { x: scaleX, y: scaleY } = readScale(
		bounds,
		parent.ownerDocument.defaultView!.getComputedStyle(parent),
	);
	return {
		x: bounds.left + (rect.x + parent.clientLeft - parent.scrollLeft) * scaleX,
		y: bounds.top + (rect.y + parent.clientTop - parent.scrollTop) * scaleY,
		width: rect.width * scaleX,
		height: rect.height * scaleY,
	};
}

/**
 * Preview is an absolute child of a positioned parent. Both measurements share
 * viewport coordinates, so outer scrolling cancels out. Account for the parent's
 * own scrolling, border, and axis-aligned scaling when entering its coordinates.
 */
export function toLocalRect(rect: Rect, parent: HTMLElement): Rect {
	const bounds = parent.getBoundingClientRect();
	const { x: scaleX, y: scaleY } = readScale(
		bounds,
		parent.ownerDocument.defaultView!.getComputedStyle(parent),
	);
	return {
		x: (rect.x - bounds.left) / scaleX - parent.clientLeft + parent.scrollLeft,
		y: (rect.y - bounds.top) / scaleY - parent.clientTop + parent.scrollTop,
		width: rect.width / scaleX,
		height: rect.height / scaleY,
	};
}

/** offsetWidth/Height round to integers, creating a false scale for fractional boxes. */
function readScale(bounds: DOMRect, style: CSSStyleDeclaration) {
	let width = Number.parseFloat(style.width);
	let height = Number.parseFloat(style.height);
	if (style.boxSizing !== "border-box") {
		width +=
			Number.parseFloat(style.paddingLeft) +
			Number.parseFloat(style.paddingRight) +
			Number.parseFloat(style.borderLeftWidth) +
			Number.parseFloat(style.borderRightWidth);
		height +=
			Number.parseFloat(style.paddingTop) +
			Number.parseFloat(style.paddingBottom) +
			Number.parseFloat(style.borderTopWidth) +
			Number.parseFloat(style.borderBottomWidth);
	}
	return {
		x: width > 0 ? bounds.width / width : 1,
		y: height > 0 ? bounds.height / height : 1,
	};
}
