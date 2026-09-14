import { expect, test } from "vitest";
import { CarouselScrollController } from "./carousel-scroll-controller";
import type { CarouselGeometry } from "./types";

function viewport(geometry: CarouselGeometry) {
	let offset = 0;
	return {
		geometry,
		getOffset: () => offset,
		getViewportSize: () => geometry.viewportSize,
		scrollTo: (next: number) => {
			offset = next;
		},
	};
}

test("prepending media preserves the selected message and its onscreen position in both tracks", () => {
	const controller = new CarouselScrollController("selected");
	const detail = viewport({
		itemSize: 1000,
		viewportSize: 1000,
		padding: 1000,
	});
	const thumb = viewport({ itemSize: 100, viewportSize: 1000, padding: 450 });
	const items = ["first", "selected", "last"];
	controller.update(items, { detail, thumb });

	// The selected image is a quarter-screen past center.
	detail.scrollTo(2250);
	controller.onScroll("detail");
	expect(controller.messageKey).toBe("selected");
	expect(thumb.getOffset()).toBe(125);

	controller.update(["older-1", "older-2", ...items], { detail, thumb });

	// Two added items must not move the existing content relative to the viewport.
	expect(controller.messageKey).toBe("selected");
	expect(detail.getOffset()).toBe(4250);
	expect(thumb.getOffset()).toBe(325);
});
