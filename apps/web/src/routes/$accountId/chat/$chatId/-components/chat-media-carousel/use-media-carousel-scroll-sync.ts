import { MessageType } from "@repo/types";
import { Virtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { ScrollAreaViewportRelativePosition } from "./types";
import { createMessageURI } from "./utils";

interface UseMediaCarouselScrollSyncOptions {
	phase: "idle" | "preparing" | "ready";
	account: { id: string };
	messages: MessageType[];
	detailVirtualizer: Virtualizer<HTMLDivElement, Element>;
	thumbVirtualizer: Virtualizer<HTMLDivElement, Element>;
	debugLog: (label: string, payload?: unknown) => void;
}

interface UseMediaCarouselScrollSyncResult {
	handleDetailScroll: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
	handleThumbScroll: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
}

export function useMediaCarouselScrollSync(
	options: UseMediaCarouselScrollSyncOptions,
): UseMediaCarouselScrollSyncResult {
	const {
		phase,
		account,
		messages,
		detailVirtualizer,
		thumbVirtualizer,
		debugLog,
	} = options;

	const detailScrollEventReasonRef = useRef<"self" | "controller">("self");
	const thumbScrollEventReasonRef = useRef<"self" | "controller">("self");

	const reportDetailScrollPosition = (
		position: ScrollAreaViewportRelativePosition,
	) => {
		if (!thumbVirtualizer.scrollRect) return;

		const targetIndex = messages.findIndex(
			(message) =>
				createMessageURI({ message, account }) === position.referenceMessageUri,
		);
		// TODO: 使用 measurementsCache 是为了能找到当前不存在 DOM 中的项，但感觉使用这个 API 并不是被推荐的
		const targetMeasurement = thumbVirtualizer.measurementsCache[targetIndex];
		if (!targetMeasurement) return;

		const scrollLeft =
			targetMeasurement.start +
			targetMeasurement.size * ((position.offsetProgress + 1) / 2);

		debugLog("scrollSync.detail→thumb", {
			referenceMessageUri: position.referenceMessageUri,
			offsetProgress: position.offsetProgress,
			scrollLeft,
		});

		thumbScrollEventReasonRef.current = "controller";
		thumbVirtualizer.scrollToOffset(scrollLeft, {
			align: "center",
			behavior: "instant",
		});
	};

	const reportThumbScrollPosition = (
		position: ScrollAreaViewportRelativePosition,
	) => {
		if (!detailVirtualizer.scrollRect) return;

		const targetIndex = messages.findIndex(
			(message) =>
				createMessageURI({ message, account }) === position.referenceMessageUri,
		);
		const targetMeasurement = detailVirtualizer.measurementsCache[targetIndex];
		if (!targetMeasurement) return;

		const scrollLeft =
			targetMeasurement.start +
			targetMeasurement.size * ((position.offsetProgress + 1) / 2);

		debugLog("scrollSync.thumb→detail", {
			referenceMessageUri: position.referenceMessageUri,
			offsetProgress: position.offsetProgress,
			scrollLeft,
		});

		detailScrollEventReasonRef.current = "controller";
		detailVirtualizer.scrollToOffset(scrollLeft, {
			align: "center",
			behavior: "instant",
		});
	};

	const handleDetailScroll = (
		event: React.UIEvent<HTMLDivElement, UIEvent>,
	) => {
		if (phase !== "ready") return;
		if (!detailVirtualizer.scrollRect) return;

		if (detailScrollEventReasonRef.current === "controller") {
			detailScrollEventReasonRef.current = "self";
			return;
		}

		const currentScrollOffset = event.currentTarget.scrollLeft;
		const viewportCenterOffset =
			currentScrollOffset + detailVirtualizer.scrollRect.width / 2;
		const currentItem =
			detailVirtualizer.getVirtualItemForOffset(viewportCenterOffset);
		if (!currentItem) return;

		const currentProgress =
			((viewportCenterOffset - currentItem.size / 2 - currentItem.start) /
				currentItem.size) *
			2;

		reportDetailScrollPosition({
			referenceMessageUri: String(currentItem.key),
			offsetProgress: currentProgress,
		});
	};

	const handleThumbScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
		if (phase !== "ready") return;
		if (!thumbVirtualizer.scrollRect) return;

		if (thumbScrollEventReasonRef.current === "controller") {
			thumbScrollEventReasonRef.current = "self";
			return;
		}

		const currentScrollOffset = event.currentTarget.scrollLeft;
		const viewportCenterOffset =
			currentScrollOffset + thumbVirtualizer.scrollRect.width / 2;
		const currentItem =
			thumbVirtualizer.getVirtualItemForOffset(viewportCenterOffset);
		if (!currentItem) return;

		const currentProgress =
			((viewportCenterOffset - currentItem.size / 2 - currentItem.start) /
				currentItem.size) *
			2;

		reportThumbScrollPosition({
			referenceMessageUri: String(currentItem.key),
			offsetProgress: currentProgress,
		});
	};

	return { handleDetailScroll, handleThumbScroll };
}
