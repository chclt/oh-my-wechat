import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { parsePlainTextContent, parseXMLContent } from "./libs.tsx";
import type { SystemExtendedMessageProps } from "./types.ts";

export function SystemExtendedMessageDefault({
	accountId,
	message,
	...props
}: SystemExtendedMessageProps) {
	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, message.chat_id),
	);

	if (message.message_entity.sysmsg) {
		const content = parseXMLContent(message, chat);

		return (
			<div
				className={"mx-auto px-14 text-sm text-center text-neutral-600"}
				{...props}
			>
				<p className="text-pretty">
					<span className="px-2 py-1 box-decoration-clone">
						{message.message_entity.sysmsg["@_type"] === "editrevokecontent" &&
							message.message_entity.sysmsg["editrevokecontent"].text}
						{message.message_entity.sysmsg["@_type"] === "sysmsgtemplate" &&
							content}
					</span>
				</p>
			</div>
		);
	} else {
		const content = parsePlainTextContent(message, chat);

		return (
			<div
				className={"mx-auto px-14 text-sm text-center text-neutral-600"}
				{...props}
			>
				<p>{content}</p>
			</div>
		);
	}
}
