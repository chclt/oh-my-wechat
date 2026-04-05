import { FileBendSolid } from "@/components/central-icon";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import { decodeUnicodeReferences } from "@/lib/utils";
import { AttachMessageProps } from "./types";

export function AttachMessageAbstract({
	message,
	...props
}: Omit<AttachMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			<span className="-ml-1 relative inline-block size-[1.5em] align-bottom text-black/45 [&_svg]:inline [&_svg]:absolute [&_svg]:inset-0 [&_svg]:m-auto [&_svg]:size-[1.25em] [&_svg]:rounded-[3px] me-[0.15em]">
				<FileBendSolid />
			</span>
			[文件] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
