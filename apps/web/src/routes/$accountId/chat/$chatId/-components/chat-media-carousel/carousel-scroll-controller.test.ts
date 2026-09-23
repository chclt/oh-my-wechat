import { describe, expect, it, vi } from "vitest";
import { CarouselScrollController } from "./carousel-scroll-controller";
import type { CarouselGeometry, CarouselKind } from "./types";

const keys = Array.from({ length: 20 }, (_, index) => `message-${index}`);
const detailGeometry = { itemSize: 1000, viewportSize: 1000, padding: 1000 };
const thumbGeometry = { itemSize: 96, viewportSize: 1000, padding: 452 };

function setup() {
	const controller = new CarouselScrollController(keys[4]);
	const track = (kind: CarouselKind, geometry: CarouselGeometry) => {
		let offset = 0;
		return {
			geometry,
			getOffset: () => offset,
			getViewportSize: vi.fn(() => geometry.viewportSize),
			scrollTo: (next: number) => {
				offset = next;
			},
			userScroll: (next: number) => {
				offset = next;
				controller.onScroll(kind);
			},
		};
	};
	const detail = track("detail", detailGeometry);
	const thumb = track("thumb", thumbGeometry);
	controller.update(keys, { detail, thumb });
	return { controller, detail, thumb };
}

describe("carousel position ownership", () => {
	it.each([
		["detail", "thumb", 5250, 408, 384],
		["thumb", "detail", 408, 5250, 5000],
	] as const)(
		"preserves %s progress without feedback from %s",
		(source, follower, offset, expected, correction) => {
			const { controller, ...tracks } = setup();
			controller.takeControl(source);
			tracks[source].userScroll(offset);
			expect(tracks[follower].getOffset()).toBe(expected);
			// The follower's displayed position cannot change the gesture source.
			tracks[follower].userScroll(correction);
			expect(tracks[source].getOffset()).toBe(offset);
		},
	);

	it("preserves thumbnail progress when images prepend or the viewport resizes", () => {
		const { controller, detail, thumb } = setup();
		controller.takeControl("thumb");
		thumb.userScroll(408);
		const prepended = ["older-1", "older-2", ...keys];
		controller.update(prepended, { detail, thumb });
		expect(detail.getOffset()).toBe(7250);
		expect(thumb.getOffset()).toBe(600);
		detail.geometry = { itemSize: 800, viewportSize: 800, padding: 800 };
		thumb.geometry = { itemSize: 96, viewportSize: 800, padding: 352 };
		controller.update(prepended, { detail, thumb });
		expect(detail.getOffset()).toBe(5800);
		expect(thumb.getOffset()).toBe(600);
	});

	it("takes over from the displayed detail center after thumbnail scrolling", () => {
		const { controller, detail, thumb } = setup();
		controller.takeControl("thumb");
		thumb.userScroll(408);
		detail.userScroll(6000);
		expect(controller.currentKey).toBe(keys[5]);
		expect(controller.messageKey).toBe(keys[4]);
		detail.userScroll(5000);
		controller.takeControl("detail");
		controller.update(keys, { detail, thumb });
		expect(detail.getOffset()).toBe(5000);
		expect(thumb.getOffset()).toBe(384);
		detail.userScroll(5250);
		expect(thumb.getOffset()).toBe(408);
	});

	it("ignores native re-snap before the new viewport geometry is committed", () => {
		const { controller, detail, thumb } = setup();
		controller.takeControl("thumb");
		thumb.getViewportSize.mockReturnValue(800);
		thumb.userScroll(484);
		// This event belongs to a resize, not a move from message 4 to 5.
		expect(detail.getOffset()).toBe(5000);
		detail.geometry = { itemSize: 800, viewportSize: 800, padding: 800 };
		thumb.geometry = { itemSize: 96, viewportSize: 800, padding: 352 };
		controller.update(keys, { detail, thumb });
		expect(detail.getOffset()).toBe(4000);
		expect(thumb.getOffset()).toBe(384);
	});
});
