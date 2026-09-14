import { useRouterState } from "@tanstack/react-router";
import { CircleXIcon, SearchIcon } from "lucide-react";
import { useEffect, useRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useContentSearch } from "./content-search-provider";
import { useCompositionInput } from "./use-composition-input";

interface ContentSearchInputProps extends HTMLAttributes<HTMLDivElement> {
	isSearchEnabled?: boolean;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onCancel?: () => void;
}

export function ContentSearchInput({
	isSearchEnabled: isSearchEnabledProp,
	onFocus,
	onCancel,

	className,
	...props
}: ContentSearchInputProps) {
	const {
		isSearchEnabled,
		searchQuery,
		setSearchQuery,
		openSearch,
		closeSearch,
	} = useContentSearch();
	const shouldShowCancelButton = isSearchEnabledProp ?? isSearchEnabled;
	const searchInput = useCompositionInput({
		value: searchQuery,
		onValueChange: setSearchQuery,
	});
	const inputRef = useRef<HTMLInputElement>(null);
	const focusRequestId = useRouterState({
		select: (state) => state.location.state.contentSearchFocusRequestId,
	});
	useEffect(() => {
		if (!isSearchEnabled) {
			inputRef.current?.blur();
			return;
		}
		if (!focusRequestId) return;
		inputRef.current?.focus({ preventScroll: true });
		inputRef.current?.select();
	}, [focusRequestId, isSearchEnabled]);

	const cancelSearch = () => {
		searchInput.resetInputValue();
		closeSearch();
		onCancel?.();
	};

	return (
		<div
			className={cn("absolute inset-x-0 top-0 z-10 h-16 p-2.5", className)}
			{...props}
		>
			<label className="sr-only" htmlFor="chat-list-search-input">
				搜索聊天和消息
			</label>
			<div className="h-full relative">
				<SearchIcon className="absolute start-4 inset-y-0 my-auto size-4 text-muted-foreground" />
				<input
					ref={inputRef}
					id="chat-list-search-input"
					type="search"
					value={searchInput.inputValue}
					onFocus={(event) => {
						if (!isSearchEnabled) openSearch();
						onFocus?.(event);
					}}
					onCompositionStart={searchInput.onCompositionStart}
					onCompositionEnd={searchInput.onCompositionEnd}
					onChange={searchInput.onChange}
					placeholder="搜索"
					className="block size-full min-w-0 px-11 px-4 bg-muted rounded-[9px] outline-none [&::-webkit-search-cancel-button]:hidden"
				/>

				{shouldShowCancelButton && (
					<button
						type="button"
						aria-label="取消搜索"
						className="absolute end-2 inset-y-0 my-auto size-8 flex items-center justify-center text-muted-foreground"
						onClick={cancelSearch}
					>
						<CircleXIcon className="size-4" />
					</button>
				)}
			</div>
		</div>
	);
}
