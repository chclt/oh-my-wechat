import { ContactType } from "@repo/types";
import { Link } from "@tanstack/react-router";
import { Avatar } from "@/components/ui/avatar";
import { formatContactTitle } from "./message-result-utils";

export function ContactResultItem({
	accountId,
	contactItem,
}: {
	accountId: string;
	contactItem: ContactType;
}) {
	return (
		<li>
			<Link
				to="/$accountId/chat/$chatId"
				params={{ accountId, chatId: contactItem.id }}
				search={(search) => ({ ...search, messageLocalId: undefined })}
				className="flex gap-2.5 hover:bg-muted"
			>
				<div className="shrink-0 py-2.5 ps-2.5">
					<Avatar
						src={contactItem.photo?.thumb}
						className="w-12 h-12 clothoid-corner-2 bg-[#DDDFE0]"
					/>
				</div>

				<div className="min-w-0 flex-grow py-2.5 pe-5 flex items-center border-b border-muted">
					<div className="min-w-0">
						<div className="truncate font-medium">
							{formatContactTitle(contactItem)}
						</div>
					</div>
				</div>
			</Link>
		</li>
	);
}
