import { MessageBubbleGroup } from "@/components/message-bubble-group.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import MessageRecord from "@/components/message-record/message-record.tsx";
import dialogClasses from "@/components/ui/dialog.module.css";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import type { MessageType } from "@/schema";
import { Dialog } from "@base-ui/react";
import { XMLParser } from "fast-xml-parser";
import {
	type ForwardMessageContent,
	forwardMessageRecordVariants,
	forwardMessageVariants,
} from "./libs";
import type { ForwardMessageProps } from "./types";

export function ForwardMessageDefault({
	message,
	className,
	...props
}: ForwardMessageProps) {
	const xmlParser = new XMLParser({
		parseAttributeValue: true,
		ignoreAttributes: false,
		tagValueProcessor: (_, tagValue, jPath) => {
			if (jPath.endsWith("datatitle") || jPath.endsWith("datadesc")) {
				return undefined;
			}
			return tagValue;
		},
	});

	const title = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	const records: ForwardMessageContent = xmlParser.parse(
		decodeUnicodeReferences(
			message.message_entity.msg.appmsg.recorditem.replace(/&#x20;/g, " "),
		),
	);

	return (
		<div
			className={forwardMessageVariants({
				variant: "default",
				direction: message.direction,
				className,
			})}
			{...props}
		>
			<h4 className="font-medium">{title}</h4>
			{records && (
				<div
					className={forwardMessageRecordVariants({
						variant: "default",
						direction: message.direction,
						className,
					})}
					style={{
						maskImage: "linear-gradient(to top, transparent 0%, black 2rem)",
					}}
				>
					{(Array.isArray(records.recordinfo.datalist.dataitem)
						? records.recordinfo.datalist.dataitem
						: [records.recordinfo.datalist.dataitem]
					).map((record) => (
						<MessageInlineWrapper
							key={record["@_dataid"]}
							message={
								{
									from: {
										id: record.sourcename,
										user_id: record.sourcename,
										username: record.sourcename,
										photo: { thumb: record.sourceheadurl },
										bio: "",
									},
								} as MessageType
							}
							className={"[&>img]:top-0"}
						>
							<MessageRecord
								message={message}
								record={record}
								variant="abstract"
							/>
						</MessageInlineWrapper>
					))}
				</div>
			)}
			<Dialog.Root>
				<Dialog.Trigger className="absolute inset-0" />
				<Dialog.Portal>
					<Dialog.Backdrop className={dialogClasses.Backdrop} />
					<Dialog.Popup
						className={cn(
							dialogClasses.Popup,
							"h-[calc(100dvh-6rem)] max-w-md p-0 bg-neutral-100 overflow-hidden block",
						)}
					>
						<ScrollArea className="size-full">
							<div className="z-10 sticky top-0 p-4 bg-neutral-100">
								<Dialog.Title className={dialogClasses.Title}>
									{title}
								</Dialog.Title>
							</div>
							<div className="space-y-2 p-4 pt-0">
								{(Array.isArray(records.recordinfo.datalist.dataitem)
									? records.recordinfo.datalist.dataitem
									: [records.recordinfo.datalist.dataitem]
								).map((record) => (
									<MessageBubbleGroup
										key={record["@_dataid"]}
										user={{
											id: record.sourcename,
											user_id: record.sourcename,
											username: record.sourcename,
											photo: { thumb: record.sourceheadurl },
											is_openim: false,
										}}
										showUsername={true}
										className="[&>.sticky]:top-[3.125rem]"
									>
										<MessageRecord message={message} record={record} />
									</MessageBubbleGroup>
								))}
							</div>
						</ScrollArea>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}
