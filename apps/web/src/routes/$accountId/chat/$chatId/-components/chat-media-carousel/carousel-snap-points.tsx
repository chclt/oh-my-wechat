import type { VirtualItem } from "@tanstack/react-virtual";

/** Keep snap targets mounted while the virtualized media window moves. */
export function CarouselSnapPoints({
	items,
}: {
	items: readonly VirtualItem[];
}) {
	// TanStack's lazy measurements are a sparse proxy. Array.from reads every
	// index; map skips the holes and would still mount/unmount snap targets.
	return Array.from(items, (item) => (
		<div
			// These are physical slots, not messages. Prepending messages must not
			// prepend snap nodes: WebKit can retain a snap index across DOM changes.
			key={item.index}
			aria-hidden="true"
			className="absolute top-0 h-full pointer-events-none snap-normal snap-center"
			style={{ left: item.start, width: item.size }}
		/>
	));
}
