import { CircleXIcon, SearchIcon } from "lucide-react";
import { HTMLAttributes } from "react";
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

	return (
		<div
			className={cn("absolute inset-x-0 top-0 z-10 h-16 p-2.5", className)}
			{...props}
		>
			<label className="sr-only" htmlFor="chat-list-search-input">
				搜索联系人和聊天记录
			</label>
			<div className="h-full relative">
				<SearchIcon className="absolute start-4 inset-y-0 my-auto size-4 text-muted-foreground" />
				<input
					id="chat-list-search-input"
					type="search"
					value={searchInput.inputValue}
					onFocus={(event) => {
						openSearch();
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
						className="absolute end-2 inset-y-0 my-auto size-8 flex items-center justify-center text-muted-foreground"
						onClick={() => {
							searchInput.resetInputValue();
							closeSearch();
							onCancel?.();
						}}
					>
						<CircleXIcon className="size-4" />
					</button>
				)}
			</div>
		</div>
	);
}
