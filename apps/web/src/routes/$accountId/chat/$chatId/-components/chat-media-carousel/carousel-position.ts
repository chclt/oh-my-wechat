import type { CarouselGeometry, CarouselPosition } from "./types";

export function getCenteredOffset(index: number, geometry: CarouselGeometry) {
	return (
		geometry.padding +
		(index + 0.5) * geometry.itemSize -
		geometry.viewportSize / 2
	);
}

export function readCarouselPosition(
	offset: number,
	keys: readonly string[],
	geometry: CarouselGeometry,
): CarouselPosition | null {
	if (!keys.length || geometry.itemSize <= 0) return null;
	const center =
		(offset + geometry.viewportSize / 2 - geometry.padding) / geometry.itemSize;
	const index = Math.max(0, Math.min(keys.length - 1, Math.floor(center)));
	return { messageKey: keys[index], progress: center - index - 0.5 };
}

export function getPositionOffset(
	position: CarouselPosition,
	indexes: ReadonlyMap<string, number>,
	geometry: CarouselGeometry,
) {
	const index = indexes.get(position.messageKey);
	return index === undefined
		? null
		: getCenteredOffset(index + position.progress, geometry);
}
