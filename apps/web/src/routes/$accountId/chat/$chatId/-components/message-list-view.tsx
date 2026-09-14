import { ScrollArea as ScrollAreaBase } from "@base-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ComponentProps,
} from "react";
import { LoaderIcon } from "@/components/icon";
import { ScrollAreaScrollBar } from "@/components/ui/scroll-area";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import type { MessageListInfiniteQueryOptions } from "@/lib/fetchers/message";
import { cn } from "@/lib/utils";
import { getMessageTargetKey } from "../../-lib/message-target";
import MessageList from "./message-list";

type WindowProps = Omit<
	ComponentProps<typeof MessageList>,
	| "viewport"
	| "positionEnabled"
	| "visible"
	| "onPrepared"
	| "messageListInfiniteQueryResult"
> & {
	windowKey: string;
	queryOptions: ReturnType<typeof MessageListInfiniteQueryOptions>;
};

export default function MessageListView(props: WindowProps) {
	const [presentation, setPresentation] = useState({
		requestedKey: props.windowKey,
		visibleKey: null as string | null,
		failed: false,
	});
	if (presentation.requestedKey !== props.windowKey) {
		setPresentation({
			...presentation,
			requestedKey: props.windowKey,
			failed: false,
		});
	}
	// Keep the last presented window until its replacement has measured and positioned itself.
	const previous = useRef<WindowProps | null>(null);
	const { visibleKey } = presentation;
	const isVisible = visibleKey === props.windowKey;
	const retained = !isVisible ? previous.current : null;
	const onPrepared = useCallback(
		(valid: boolean) =>
			setPresentation((current) => {
				if (current.requestedKey !== props.windowKey) return current;
				const nextKey = valid ? props.windowKey : current.visibleKey;
				if (current.visibleKey === nextKey && current.failed === !valid)
					return current;
				return { ...current, visibleKey: nextKey, failed: !valid };
			}),
		[props.windowKey],
	);
	useLayoutEffect(() => {
		if (isVisible) previous.current = props;
	}, [isVisible, props]);
	const windows = retained ? [retained, props] : [props];

	return (
		<div className="absolute inset-0">
			{windows.map((window) => (
				<MessageWindowViewport
					key={window.windowKey}
					{...window}
					visible={window.windowKey === visibleKey}
					positionEnabled={window.windowKey === props.windowKey}
					showPlaceholder={!isVisible && !retained && !presentation.failed}
					onPrepared={
						window.windowKey === props.windowKey ? onPrepared : undefined
					}
				/>
			))}
		</div>
	);
}

function MessageWindowViewport({
	windowKey,
	visible,
	positionEnabled,
	showPlaceholder,
	onPrepared,
	queryOptions,
	...props
}: WindowProps & {
	visible: boolean;
	positionEnabled: boolean;
	showPlaceholder: boolean;
	onPrepared?: (valid: boolean) => void;
}) {
	const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
	const query = useInfiniteQuery(queryOptions);
	const targetKey = getMessageTargetKey(props.target);
	useEffect(() => {
		if (
			!positionEnabled ||
			targetKey === "latest" ||
			!query.isError ||
			query.data
		)
			return;
		console.error("[消息定位] 加载目标消息失败", {
			windowKey,
			targetKey,
			error: query.error,
		});
	}, [
		positionEnabled,
		windowKey,
		targetKey,
		query.isError,
		query.data,
		query.error,
		query.errorUpdatedAt,
	]);
	return (
		<>
			<div
				data-slot="message-window"
				data-active={positionEnabled}
				data-visible={visible}
				className="absolute inset-0"
				style={{ visibility: visible ? "visible" : "hidden" }}
				inert={!visible}
				aria-hidden={!visible}
			>
				<ScrollAreaBase.Root
					className={cn(
						scrollAreaClasses.Root,
						"size-full contain-strict bg-neutral-100 [&_[data-slot='scroll-area-scrollbar']]:z-50 [&_[data-slot='scroll-area-scrollbar']]:top-16!",
					)}
				>
					{/* Each window prepares its own scroll position without moving the retained view. */}
					<ScrollAreaBase.Viewport
						data-slot="message-list-viewport"
						className={scrollAreaClasses.Viewport}
						style={{ overflowAnchor: "none" }}
						ref={setViewport}
					>
						{query.data && (
							<MessageList
								{...props}
								viewport={viewport}
								positionEnabled={positionEnabled}
								visible={visible}
								messageListInfiniteQueryResult={query}
								onPrepared={onPrepared}
							/>
						)}
					</ScrollAreaBase.Viewport>
					<ScrollAreaScrollBar />
					<ScrollAreaBase.Corner />
				</ScrollAreaBase.Root>
			</div>
			{showPlaceholder && (
				<div className="h-full flex items-center justify-center text-neutral-400">
					{query.isError ? (
						<button type="button" onClick={() => void query.refetch()}>
							加载失败，重试
						</button>
					) : (
						<span role="status" aria-label="加载聊天记录">
							<LoaderIcon className="size-5 animate-spin" />
						</span>
					)}
				</div>
			)}
		</>
	);
}
