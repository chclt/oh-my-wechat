import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { parsePlainTextContent, parseXMLContent } from "./libs.tsx";
import type { SystemExtendedMessageProps } from "./types.ts";

export function SystemExtendedMessageAbstract({
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
			<p>
				{message.message_entity.sysmsg["@_type"] === "editrevokecontent" &&
					message.message_entity.sysmsg["editrevokecontent"].text}
				{message.message_entity.sysmsg["@_type"] === "sysmsgtemplate" &&
					content}
			</p>
		);
	} else {
		const content = parsePlainTextContent(message, chat);
		// TODO
		return (
			<div {...props}>
				<p>{content}</p>
			</div>
		);
	}
}
