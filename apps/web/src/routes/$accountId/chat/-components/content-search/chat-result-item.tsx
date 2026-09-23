import type { ChatType } from "@repo/types";
import { Link } from "@tanstack/react-router";
import { Avatar } from "@/components/ui/avatar";
import { clearMessageTargetSearch } from "../../-lib/message-target";

export function ChatResultItem({
	accountId,
	chat,
}: {
	accountId: string;
	chat: ChatType;
}) {
	return (
		<li>
			<Link
				to="/$accountId/chat/$chatId"
				params={{ accountId, chatId: chat.id }}
				search={clearMessageTargetSearch}
				className="flex gap-2.5 hover:bg-muted"
			>
				<div className="shrink-0 py-2.5 ps-2.5">
					<Avatar
						src={chat.photo}
						className="w-12 h-12 clothoid-corner-2 bg-[#DDDFE0]"
					/>
				</div>

				<div className="min-w-0 flex-grow py-2.5 pe-5 flex items-center border-b border-muted">
					<div className="min-w-0">
						<div className="truncate font-medium">{chat.title}</div>
					</div>
				</div>
			</Link>
		</li>
	);
}
