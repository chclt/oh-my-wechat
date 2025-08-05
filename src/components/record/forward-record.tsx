import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import {
	MessageDirection,
	type MessageType,
	type RecordTypeEnum,
} from "@/lib/schema.ts";

import { MessageBubbleGroup } from "@/components/message-bubble-group";

import {
	type ForwardMessageRecord as ForwardMessageRecordType,
	forwardMessageRecordVariants,
	forwardMessageVariants,
} from "@/components/message/app-message/forward-message";
import MessageInlineWrapper from "@/components/message/message-inline";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ScrollArea } from "../ui/scroll-area";
import Record, { type RecordType } from "./record";

interface ForwardMessageRecordProps
	extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: ForwardMessageRecordEntity;
	variant: "default" | string;
}

export interface ForwardMessageRecordEntity extends RecordType {
	"@_datatype": RecordTypeEnum.FORWARD_MESSAGE;
	datatitle: string;
	datadesc: string;
	recordxml: {
		recordinfo: {
			datalist: {
				dataitem: ForwardMessageRecordType[];
			};
		};
	};
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
							direction: message.direction,
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
								<Record message={message} record={i} variant="abstract" />
							</MessageInlineWrapper>
						))}
					</div>
				)}
				<Dialog>
					<DialogTrigger asChild>
						<button className="absolute inset-0" type="button" />
					</DialogTrigger>
					<DialogContent
						className={
							"h-[calc(100dvh-6rem)] p-0 bg-neutral-100 overflow-hidden block"
						}
					>
						<ScrollArea className="h-full">
							<DialogHeader className="z-10 sticky top-0 p-4 bg-neutral-100">
								<DialogTitle>{record.datatitle}</DialogTitle>
								<VisuallyHidden>
									<DialogDescription>{record.datatitle}</DialogDescription>
								</VisuallyHidden>
							</DialogHeader>
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
											className={"[&>img]:top-0"}
										>
											<Record message={message} record={record} />
										</MessageBubbleGroup>
									),
								)}
							</div>
						</ScrollArea>
					</DialogContent>
				</Dialog>
			</div>
		);

	return <p className="inline">[转发] {record.datatitle}</p>;
}
