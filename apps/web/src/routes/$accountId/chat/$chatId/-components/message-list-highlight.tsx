import { useLayoutEffect, useRef } from "react";

export function MessageListHighlight({
	top,
	height,
}: {
	top: number;
	height: number;
}) {
	const ref = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const animation = ref.current!.animate(
			[{ opacity: 1, offset: 0 }, { opacity: 1, offset: 0.65 }, { opacity: 0 }],
			{ duration: 2000, easing: "ease-out" },
		);
		return () => animation.cancel();
	}, []);

	return (
		<div
			ref={ref}
			data-slot="message-row-highlight"
			aria-hidden="true"
			className="pointer-events-none absolute inset-x-0 top-0 -z-10 bg-black/10 dark:bg-white/10 opacity-0"
			style={{ transform: `translateY(${top}px)`, height }}
		/>
	);
}
