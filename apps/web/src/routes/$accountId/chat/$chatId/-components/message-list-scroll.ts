import {
	elementScroll,
	type VirtualizerOptions,
} from "@tanstack/react-virtual";

export interface MessageScrollOrigin {
	chatId: string;
	createTime: number;
}

export type MessageScrollDirection = -1 | 1;
export const MESSAGE_SCROLL_DURATION = 250;

export function getMessageInitialPosition(
	origin: MessageScrollOrigin | null | undefined,
	target: MessageScrollOrigin,
): { behavior: "instant" | "smooth"; direction?: MessageScrollDirection } {
	return origin?.chatId === target.chatId
		? {
				behavior: "smooth",
				direction: target.createTime > origin.createTime ? 1 : -1,
			}
		: { behavior: "instant" };
}

export function getMessageScrollPlan({
	start,
	size,
	scrollTop,
	viewportHeight,
	maxOffset,
	initialDirection,
}: {
	start: number;
	size: number;
	scrollTop: number;
	viewportHeight: number;
	maxOffset: number;
	initialDirection?: MessageScrollDirection;
}) {
	const center = start + size / 2 - viewportHeight / 2;
	const clamp = (offset: number) => Math.max(0, Math.min(maxOffset, offset));
	const gap = Math.max(
		start - scrollTop - viewportHeight,
		scrollTop - start - size,
		0,
	);
	const direction = initialDirection ?? (center < scrollTop ? -1 : 1);
	return {
		offset: clamp(center),
		stagingOffset:
			initialDirection !== undefined || gap > viewportHeight
				? clamp(center - direction * viewportHeight)
				: undefined,
	};
}

type ScrollToFn = VirtualizerOptions<
	HTMLDivElement,
	HTMLDivElement
>["scrollToFn"];

export function createMessageListScroll() {
	let animation: {
		win: Window;
		frame: number;
	} | null = null;
	const cancel = () => {
		if (animation) animation.win.cancelAnimationFrame(animation.frame);
		animation = null;
	};
	const scrollTo = (
		offset: number,
		options: Parameters<ScrollToFn>[1],
		instance: Parameters<ScrollToFn>[2],
		onComplete?: () => void,
	) => {
		cancel();
		const viewport = instance.scrollElement;
		const win = viewport?.ownerDocument.defaultView;
		if (!viewport || !win) return;
		const to = offset + (options.adjustments ?? 0);
		if (options.behavior !== "smooth") {
			elementScroll(offset, { ...options, behavior: "instant" }, instance);
			onComplete?.();
			return;
		}
		const from = viewport.scrollTop;
		const startedAt = win.performance.now();
		const current = { win, frame: 0 };
		animation = current;
		const tick = (now: number) => {
			if (animation !== current) return;
			const progress = Math.max(
				0,
				Math.min(1, (now - startedAt) / MESSAGE_SCROLL_DURATION),
			);
			const eased = 1 - (1 - progress) ** 3;
			elementScroll(
				from + (to - from) * eased,
				{ behavior: "instant" },
				instance,
			);
			if (progress < 1) current.frame = win.requestAnimationFrame(tick);
			else {
				animation = null;
				onComplete?.();
			}
		};
		current.frame = win.requestAnimationFrame(tick);
	};
	return { scrollToFn: scrollTo, scrollTo, cancel };
}

export type MessageListScroll = ReturnType<typeof createMessageListScroll>;
