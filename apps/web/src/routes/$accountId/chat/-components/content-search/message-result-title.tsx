import { Button } from "@base-ui/react";
import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import type { HTMLProps } from "react";
import { useAccount } from "@/components/account-provider.tsx";
import { ChatListQueryOptions } from "@/lib/fetchers/chat.ts";
import { cn } from "@/lib/utils.ts";
import { useContentSearch } from "./content-search-provider.tsx";

interface MessageResultTitleProps extends HTMLProps<HTMLDivElement> {
	chatScope?: string;
}

export function MessageResultTitle({
	chatScope,
	className,
	...props
}: MessageResultTitleProps) {
	const { accountId } = useAccount();
	const { setSearchFromChat } = useContentSearch();
	const { data: chat } = useQuery({
		...ChatListQueryOptions(accountId),
		select: (chats) => chats.find((chat) => chat.id === chatScope),
		enabled: Boolean(chatScope),
	});

	return (
		<div
			className={cn(
				"sticky z-10 top-0 h-11 ps-5 flex items-center texture",
				className,
			)}
			{...props}
		>
			<div className="h-full w-full min-w-0 ps-0.5 pe-5 grid grid-cols-[max-content_minmax(0,1fr)] gap-8 items-center border-b border-muted text-sm text-muted-foreground">
				聊天记录
				{chatScope && (
					<div className="min-w-0 max-w-full justify-self-end grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center whitespace-nowrap">
						<span>在</span>
						<span className="mx-1 min-w-0 truncate font-semibold">
							{chat?.title ?? chatScope}
						</span>
						<span>中搜索</span>
						<Button
							aria-label="清除聊天范围，在所有聊天中搜索"
							title="搜索所有聊天"
							className="-me-2 size-8 grid place-content-center"
							onClick={() => setSearchFromChat(undefined)}
						>
							<XIcon className="size-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
