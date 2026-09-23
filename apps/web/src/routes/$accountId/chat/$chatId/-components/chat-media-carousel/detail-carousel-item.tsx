import { type ComponentPropsWithoutRef, useLayoutEffect, useRef } from "react";

interface Props extends Omit<ComponentPropsWithoutRef<"div">, "inert"> {
	isActive: boolean;
	focusTarget: HTMLElement | null;
}

/** Keeps all controls inside an offscreen item out of keyboard and AT navigation. */
export function DetailCarouselItem({ isActive, focusTarget, ...props }: Props) {
	const ref = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const item = ref.current;
		if (!item) return;
		const returnFocus = () => {
			if (item.contains(item.ownerDocument.activeElement))
				focusTarget?.focus({ preventScroll: true });
		};
		// Move focus before inert can blur a descendant. Cleanup also covers
		// virtual items being unmounted after a large jump.
		if (!isActive) returnFocus();
		item.inert = !isActive;
		return returnFocus;
	}, [isActive, focusTarget]);
	return <div {...props} ref={ref} />;
}
