import { MessageType } from "@repo/types";
import { useEffect, useRef, useState } from "react";
import {
	calculateCenteredScrollOffsetForIndex,
	createMessageURI,
} from "./utils";

export type MediaCarouselPhase = "idle" | "preparing" | "ready";

interface UseMediaCarouselPreparePhaseOptions {
	isDialogOpen: boolean;
	account: { id: string };
	messages: MessageType[];
	initialMessage: MessageType | null;

	detailViewportElement: HTMLDivElement | null;
	thumbViewportElement: HTMLDivElement | null;

	detailItemSize: number;
	detailViewportWidth: number;
	thumbItemSize: number;
	thumbViewportWidth: number;

	debugLog: (label: string, payload?: unknown) => void;
}

interface UseMediaCarouselPreparePhaseResult {
	phase: MediaCarouselPhase;
	/**
	 * 在 phase 从 "preparing" 翻到 "ready" 之前被写入。
	 * 供 useVirtualizer 的 initialOffset 选项读取，以决定首帧 virtualItems。
	 */
	detailInitialOffsetRef: React.RefObject<number>;
	thumbInitialOffsetRef: React.RefObject<number>;
}

/**
 * 媒体浏览弹窗的“准备阶段”状态机，状态驱动版本：
 *
 *  - Effect A: dialog 开关 → setPhase('preparing' | 'idle')。
 *  - Effect B（推进）: phase==='preparing' 且所有前置条件齐了，
 *      算 targetIndex / 两个 initialOffset，
 *      写 ref + 写 viewport.scrollLeft，
 *      然后 setPhase('ready')。
 *
 * “锁定 viewport 样式”不再是命令式 effect —— 由 CarouselScrollViewport
 * 根据 isLocked = phase !== 'ready' 派生。
 *
 * 跨次打开 dialog 时复用 measurements 缓存的需求暂未实现。
 */
export function useMediaCarouselPreparePhase(
	options: UseMediaCarouselPreparePhaseOptions,
): UseMediaCarouselPreparePhaseResult {
	const {
		isDialogOpen,
		account,
		messages,
		initialMessage,
		detailViewportElement,
		thumbViewportElement,
		detailItemSize,
		detailViewportWidth,
		thumbItemSize,
		thumbViewportWidth,
		debugLog,
	} = options;

	const [phase, setPhase] = useState<MediaCarouselPhase>("idle");

	const detailInitialOffsetRef = useRef(0);
	const thumbInitialOffsetRef = useRef(0);

	// ----------------------------------------------------------
	// Effect A: dialog 开关驱动 phase 入口
	// ----------------------------------------------------------
	useEffect(() => {
		if (isDialogOpen) {
			debugLog("phase.dialogOpen → preparing");
			setPhase("preparing");
		} else {
			debugLog("phase.dialogClose → idle");
			setPhase("idle");
		}
	}, [isDialogOpen, debugLog]);

	// ----------------------------------------------------------
	// Effect B: 前置条件齐全后推进到 ready
	// ----------------------------------------------------------
	const arePrerequisitesReady =
		!!detailViewportElement &&
		!!thumbViewportElement &&
		detailViewportWidth > 0 &&
		thumbViewportWidth > 0 &&
		messages.length > 0 &&
		detailItemSize > 0 &&
		thumbItemSize > 0;

	useEffect(() => {
		if (phase !== "preparing") return;

		debugLog("phase.preparing.prerequisites", {
			arePrerequisitesReady,
			messageCount: messages.length,
			detailItemSize,
			thumbItemSize,
			detailViewportWidth,
			thumbViewportWidth,
			hasDetailViewportElement: !!detailViewportElement,
			hasThumbViewportElement: !!thumbViewportElement,
		});

		if (!arePrerequisitesReady) return;
		// 进入分支后所有元素都不为 null，TS 在闭包里仍要兜一下
		if (!detailViewportElement || !thumbViewportElement) return;

		// 算 targetIndex
		let targetIndex = -1;
		if (initialMessage) {
			const initialMessageURI = createMessageURI({
				message: initialMessage,
				account,
			});
			targetIndex = messages.findIndex(
				(message) =>
					createMessageURI({ message, account }) === initialMessageURI,
			);
		}

		// 注意：calculateCenteredScrollOffsetForIndex 假设所有 item 等宽。
		// 当前 detail / thumb 都是固定尺寸（满屏图 / 固定方块），所以这里准确。
		// 如果将来 item 尺寸可变，需要改成基于 virtualizer 真实 measurement 的方案。
		if (targetIndex >= 0) {
			const detailInitialOffset = calculateCenteredScrollOffsetForIndex({
				index: targetIndex,
				itemSize: detailItemSize,
				paddingStart: detailItemSize,
				scrollViewportSize: detailViewportWidth,
			});
			const thumbInitialOffset = calculateCenteredScrollOffsetForIndex({
				index: targetIndex,
				itemSize: thumbItemSize,
				paddingStart: Math.max((thumbViewportWidth - thumbItemSize) / 2, 0),
				scrollViewportSize: thumbViewportWidth,
			});

			detailInitialOffsetRef.current = detailInitialOffset;
			thumbInitialOffsetRef.current = thumbInitialOffset;

			detailViewportElement.scrollLeft = detailInitialOffset;
			thumbViewportElement.scrollLeft = thumbInitialOffset;

			debugLog("phase.preparing.computedOffsets", {
				targetIndex,
				detailInitialOffset,
				thumbInitialOffset,
			});
		} else {
			detailInitialOffsetRef.current = 0;
			thumbInitialOffsetRef.current = 0;
			debugLog("phase.preparing.noTargetIndex");
		}

		debugLog("phase.preparing → ready");
		setPhase("ready");
	}, [
		phase,
		arePrerequisitesReady,
		account,
		messages,
		initialMessage,
		detailViewportElement,
		thumbViewportElement,
		detailItemSize,
		detailViewportWidth,
		thumbItemSize,
		thumbViewportWidth,
		debugLog,
	]);

	return {
		phase,
		detailInitialOffsetRef,
		thumbInitialOffsetRef,
	};
}
