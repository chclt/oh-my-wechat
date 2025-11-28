import { MessageDirection, type MessageType } from "@/schema";

import { MessageBubbleGroup } from "@/components/message-bubble-group";

import MessageInlineWrapper from "@/components/message-inline-wrapper";
import {
	forwardMessageRecordVariants,
	forwardMessageVariants,
} from "@/components/message/app-message/forward-message";
import { cn } from "@/lib/utils.ts";
import type React from "react";
import { ScrollArea } from "../ui/scroll-area";
import MessageRecord from "./message-record.tsx";

import dialogClasses from "@/components/ui/dialog.module.css";
import { Dialog } from "@base-ui-components/react";
import { ForwardMessageRecordType } from "@/schema/message-record.ts";

interface ForwardMessageRecordProps
	extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: ForwardMessageRecordType;
	variant: "default" | string;
}

export default function ForwardMessageRecord({
	message,
	record,
	variant = "default",
	className,
	...props
}: ForwardMessageRecordProps) {
	const records = record.recordxml.recordinfo.datalist.dataitem;

	if (variant === "default")
		return (
			<div
				className={forwardMessageVariants({
					variant,
					direction: MessageDirection.incoming,
					className,
				})}
				{...props}
			>
				<h4 className="font-medium">{record.datatitle}</h4>
				{records && (
					<div
						className={forwardMessageRecordVariants({
							variant,
							direction: MessageDirection.incoming,
							className,
						})}
						style={{
							maskImage: "linear-gradient(to top, transparent 0%, black 2rem)",
						}}
					>
						{(Array.isArray(records) ? records : [records]).map((i) => (
							<MessageInlineWrapper
								key={i["@_dataid"]}
								message={
									{
										from: {
											id: i.sourcename,
											user_id: i.sourcename,
											username: i.sourcename,
											photo: { thumb: i.sourceheadurl },
										},
									} as MessageType
								}
								className={"[&>img]:top-0"}
							>
								<MessageRecord
									message={message}
									record={i}
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
										{record.datatitle}
									</Dialog.Title>
								</div>
								<div className="space-y-2 p-4 pt-0">
									{(Array.isArray(records) ? records : [records]).map(
										(record) => (
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
										),
									)}
								</div>
							</ScrollArea>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			</div>
		);

	return <p className="inline">[转发] {record.datatitle}</p>;
}
