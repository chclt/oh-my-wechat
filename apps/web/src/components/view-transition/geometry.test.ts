import { describe, expect, it } from "vitest";
import { readVisibleRect, toLocalRect, toViewportRect } from "./geometry";

function parent(overrides = {}) {
	return {
		getBoundingClientRect: () => ({
			left: 100,
			top: -200,
			width: 400,
			height: 600,
		}),
		offsetWidth: 400,
		offsetHeight: 600,
		clientLeft: 6,
		clientTop: 8,
		clientWidth: 388,
		clientHeight: 584,
		scrollLeft: 20,
		scrollTop: 150,
		parentElement: null,
		ownerDocument: {
			defaultView: {
				getComputedStyle: (element: HTMLElement) => ({
					width: `${element.offsetWidth}px`,
					height: `${element.offsetHeight}px`,
					boxSizing: "border-box",
				}),
			},
		},
		...overrides,
	} as unknown as HTMLElement;
}

describe("preview coordinates", () => {
	it("converts virtual-item estimates through a bordered, scrolling, scaled host", () => {
		const host = parent({ offsetWidth: 200, offsetHeight: 300 });
		const estimate = { x: 42, y: 258, width: 100, height: 75 };
		const viewport = toViewportRect(estimate, host);
		expect(viewport).toEqual({ x: 156, y: 32, width: 200, height: 150 });
		expect(toLocalRect(viewport, host)).toEqual(estimate);
	});

	it("keeps content coordinates unchanged when an outer container scrolls", () => {
		const before = toLocalRect(
			{ x: 156, y: 32, width: 200, height: 150 },
			parent(),
		);
		const after = toLocalRect(
			{ x: 156, y: -28, width: 200, height: 150 },
			parent({
				getBoundingClientRect: () => ({
					left: 100,
					top: -260,
					width: 400,
					height: 600,
				}),
			}),
		);
		expect(after).toEqual(before);
	});
});

describe("target visibility", () => {
	const container = parent({ scrollTop: 0, scrollLeft: 0 });
	function target(x: number, y: number, isConnected = true) {
		return {
			isConnected,
			getClientRects: () => [{}],
			parentElement: container,
			getBoundingClientRect: () => ({
				left: x,
				top: y,
				width: 200,
				height: 150,
			}),
			ownerDocument: {
				defaultView: {
					innerWidth: 1280,
					innerHeight: 720,
					getComputedStyle: (element: HTMLElement) => ({
						width: `${element.offsetWidth}px`,
						height: `${element.offsetHeight}px`,
						boxSizing: "border-box",
						overflowX: "auto",
						overflowY: "auto",
					}),
				},
			},
		} as unknown as HTMLElement;
	}

	it("uses full geometry for visible targets and rejects detached or fully clipped ones", () => {
		expect(readVisibleRect(target(450, 0))).toEqual({
			x: 450,
			y: 0,
			width: 200,
			height: 150,
		});
		expect(readVisibleRect(target(156, 32, false))).toBeNull();
		expect(readVisibleRect(target(500, 32))).toBeNull();
		expect(readVisibleRect(target(156, -160))).toBeNull();
	});
});
