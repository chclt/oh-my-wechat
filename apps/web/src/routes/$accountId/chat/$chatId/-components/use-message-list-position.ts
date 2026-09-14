import type { Virtualizer } from "@tanstack/react-virtual";
import {
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	type RefObject,
} from "react";
import type { MessageListItem } from "./message-list-items";
import {
	createMessageListScroll,
	getMessageInitialPosition,
	getMessageScrollPlan,
	type MessageListScroll,
	type MessageScrollDirection,
	type MessageScrollOrigin,
} from "./message-list-scroll";
import type { MessageListGeometry } from "./use-message-list-virtualizer";

type MessageVirtualizer = Virtualizer<HTMLDivElement, HTMLDivElement>;
type PositionOutcome = "landed" | "interrupted";

interface PositionOptions {
	scroll: MessageListScroll;
	behavior?: "instant" | "smooth";
	initialDirection?: MessageScrollDirection;
	trailingSize?: number;
	isPrepared: () => boolean;
	onAnimationStart?: () => void;
}

export function positionMessageList(
	instance: MessageVirtualizer,
	viewport: HTMLDivElement,
	index: number,
	onSettled: (outcome: PositionOutcome) => void,
	options: PositionOptions,
) {
	const win = viewport.ownerDocument.defaultView!;
	let frame = 0;
	let finished = false;
	const removeListeners = () => {
		viewport.removeEventListener("wheel", interrupt);
		viewport.removeEventListener("touchstart", interrupt);
		viewport.removeEventListener("pointerdown", interrupt);
		viewport.removeEventListener("keydown", onKeyDown);
	};
	const cancel = () => {
		win.cancelAnimationFrame(frame);
		removeListeners();
		if (finished) return;
		finished = true;
		options.scroll.cancel();
	};
	function interrupt() {
		cancel();
		onSettled("interrupted");
	}
	function onKeyDown(event: KeyboardEvent) {
		if (
			[
				"ArrowUp",
				"ArrowDown",
				"PageUp",
				"PageDown",
				"Home",
				"End",
				" ",
			].includes(event.key)
		)
			interrupt();
	}
	function prepare() {
		if (finished) return;
		if (options.isPrepared()) {
			const item = instance.measurementsCache[index];
			const plan = getMessageScrollPlan({
				start: item.start,
				size: item.size - (options.trailingSize ?? 0),
				scrollTop: viewport.scrollTop,
				viewportHeight: viewport.clientHeight,
				maxOffset: viewport.scrollHeight - viewport.clientHeight,
				initialDirection: options.initialDirection,
			});
			if (options.behavior !== "instant") {
				if (plan.stagingOffset !== undefined)
					options.scroll.scrollTo(
						plan.stagingOffset,
						{ behavior: "instant" },
						instance,
					);
				options.onAnimationStart?.();
			}
			// The measured plan is fixed for this request. Do not chase later layout changes.
			options.scroll.scrollTo(
				plan.offset,
				{ behavior: options.behavior ?? "smooth" },
				instance,
				() => {
					cancel();
					onSettled("landed");
				},
			);
			return;
		}
		frame = win.requestAnimationFrame(prepare);
	}
	viewport.addEventListener("wheel", interrupt, { passive: true });
	viewport.addEventListener("touchstart", interrupt, { passive: true });
	viewport.addEventListener("pointerdown", interrupt, { passive: true });
	viewport.addEventListener("keydown", onKeyDown);
	// Wait for the retained target's measurement before choosing the animation start.
	frame = win.requestAnimationFrame(prepare);
	return cancel;
}

export function useMessageListPosition(
	geometryRef: RefObject<MessageListGeometry | null>,
	viewport: HTMLDivElement | null,
	targetKey: string,
	targetIndex: number,
	items: readonly MessageListItem[],
	requestId: string | undefined,
	{
		enabled = true,
		visible = true,
		scrollOriginRef,
		onPrepared,
		onTargetReady,
	}: {
		enabled?: boolean;
		visible?: boolean;
		scrollOriginRef?: RefObject<MessageScrollOrigin | null>;
		onPrepared?: (valid: boolean) => void;
		onTargetReady?: (request: PositionRequest) => void;
	},
) {
	const count = items.length;
	const target = items[targetIndex]?.row.message;
	const trailingSize = items[targetIndex]?.trailingSize;
	const initial = useRef(
		target
			? {
					targetKey,
					completed: false,
					...getMessageInitialPosition(scrollOriginRef?.current, {
						chatId: target.chat_id,
						createTime: target.date,
					}),
				}
			: null,
	);
	const initialPositioning =
		initial.current?.targetKey === targetKey && !initial.current.completed;
	const behavior = initialPositioning ? initial.current!.behavior : "smooth";
	const initialDirection = initialPositioning
		? initial.current?.direction
		: undefined;
	const scroll = useMemo(() => createMessageListScroll(), []);
	useLayoutEffect(() => scroll.cancel, [scroll, viewport]);
	const completed = useRef<PositionRequest | null>(null);
	const [progress, setProgress] = useState<
		| (PositionRequest & {
				pending: boolean;
				prepared: boolean;
		  })
		| null
	>(null);
	useLayoutEffect(() => {
		const geometry = geometryRef.current;
		if (
			!enabled ||
			!geometry ||
			!viewport ||
			(count === 0 && targetKey === "latest") ||
			matchesPositionRequest(completed.current, targetKey, requestId)
		)
			return;
		const { virtualizer: instance, isPrepared } = geometry;
		completed.current = null;
		setProgress(null);
		let prepared = false;
		const notifyTargetReady = () =>
			onTargetReady?.({
				targetKey,
				requestId,
			});
		const settle = (outcome?: PositionOutcome | "latest") => {
			const ready = prepared || outcome === "landed" || outcome === "latest";
			if (initial.current && targetIndex >= 0 && ready)
				initial.current.completed = true;
			completed.current = {
				targetKey,
				requestId,
			};
			setProgress({
				...completed.current,
				pending: false,
				prepared: ready,
			});
			if (outcome === "landed" && behavior === "instant") notifyTargetReady();
		};
		if (targetKey === "latest") {
			scroll.scrollTo(
				Math.max(0, instance.getTotalSize() - viewport.clientHeight),
				{ behavior: "instant" },
				instance,
			);
			settle("latest");
			return;
		}
		if (targetIndex < 0) {
			console.error("[消息定位] 当前消息窗口中找不到唯一的目标消息", {
				targetKey,
				requestId,
			});
			settle();
			return;
		}
		return positionMessageList(instance, viewport, targetIndex, settle, {
			behavior,
			initialDirection,
			trailingSize,
			scroll,
			isPrepared,
			onAnimationStart: () => {
				prepared = true;
				setProgress({ targetKey, requestId, pending: true, prepared: true });
				notifyTargetReady();
			},
		});
	}, [
		enabled,
		geometryRef,
		viewport,
		targetKey,
		targetIndex,
		count,
		requestId,
		behavior,
		initialDirection,
		trailingSize,
		scroll,
		onTargetReady,
	]);
	const current = matchesPositionRequest(progress, targetKey, requestId)
		? progress
		: null;
	const empty = count === 0 && targetKey === "latest";
	const pending = enabled && !empty && (current?.pending ?? true);
	const prepared = empty || (current?.prepared ?? false);
	const recordOrigin = useCallback(
		(instance: MessageVirtualizer, offset: number) => {
			if (!visible || !scrollOriginRef || pending) return;
			const center = instance.getVirtualItemForOffset(
				offset + (viewport?.clientHeight ?? 0) / 2,
			);
			const message = center && items[center.index]?.row.message;
			if (message)
				scrollOriginRef.current = {
					chatId: message.chat_id,
					createTime: message.date,
				};
		},
		[visible, scrollOriginRef, pending, viewport, items],
	);
	useLayoutEffect(() => {
		if (prepared && geometryRef.current)
			recordOrigin(geometryRef.current.virtualizer, viewport?.scrollTop ?? 0);
	}, [prepared, recordOrigin, geometryRef, viewport]);
	useLayoutEffect(() => {
		if (enabled && viewport && (prepared || !pending)) onPrepared?.(prepared);
	}, [enabled, viewport, prepared, pending, onPrepared]);
	return {
		pending,
		hidden: initialPositioning && !prepared,
		behavior,
		initialDirection,
		scrollToFn: scroll.scrollToFn,
		onScroll: recordOrigin,
	};
}

export interface PositionRequest {
	targetKey: string;
	requestId?: string;
}

export function matchesPositionRequest(
	completed: PositionRequest | null,
	targetKey: string,
	requestId: string | undefined,
) {
	// Unrelated navigation may omit history state; that is not a new positioning request.
	return (
		completed?.targetKey === targetKey &&
		(requestId === undefined || completed.requestId === requestId)
	);
}
