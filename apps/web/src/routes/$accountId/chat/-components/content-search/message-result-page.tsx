import type { SearchMessagesResponse } from "@repo/types/adapter";
import { Link } from "@tanstack/react-router";
import { ChevronRightSmallLine } from "@/components/central-icon.tsx";
import { updateContentSearchParams } from "../../-lib/content-search-state";
import { getMessageKey } from "../../-lib/message-key";
import { MessageResultItem } from "./message-result-item.tsx";

interface MessageResultPageProps {
	accountId: string;
	data: Awaited<SearchMessagesResponse>["data"];
}

export function MessageResultPage({ accountId, data }: MessageResultPageProps) {
	return (
		<>
			{data.map((messageResult) => (
				<MessageResultItem
					key={getMessageKey(
						messageResult.chat.id,
						messageResult.messageLocalId,
					)}
					accountId={accountId}
					messageResult={messageResult}
					extraSectionProps={{
						className: "mt-1.5 text-sm text-muted-foreground",
					}}
					extraSection={
						(messageResult.matchCount ?? 0) > 1 && (
							<Link
								to="."
								replace
								search={(search) =>
									updateContentSearchParams(search, {
										search: true,
										searchFromChat: messageResult.chat.id,
									})
								}
								className="-mx-1.5 -my-1 px-1.5 py-1 rounded-sm hover:bg-input"
							>
								共 {messageResult.matchCount} 条结果
								<ChevronRightSmallLine className="relative top-[-0.1em] inline-block size-[1.25em] -me-1.5" />
							</Link>
						)
					}
				/>
			))}
		</>
	);
}
