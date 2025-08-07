import { MessageBubbleGroup } from "@/components/message-bubble-group";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import Record from "@/components/record/record";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	type AppMessageTypeEnum,
	MessageDirection,
	type MessageType,
	type RecordTypeEnum,
} from "@/schema";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cva } from "class-variance-authority";
import { XMLParser } from "fast-xml-parser";
import type React from "react";

export interface ForwardMessageEntity {
	type: AppMessageTypeEnum.FORWARD_MESSAGE;
	title: string;
	des: string;
	recorditem: string;
	appattach: {
		attachid: string;
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbheight: number;
		cdnthumbwidth: number;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: number;
		fileext: string;
		islargefilemsg: number;
	};
	md5: string;
}

export interface ForwardMessageRecord {
	"@_datatype": RecordTypeEnum;
	"@_dataid": string;
	srcMsgLocalid: number;
	datadesc: string;
	sourcename: string;
	sourceheadurl: string;
	sourcetime: string;
	dataitemsource: {
		hashusername: string;
		realchatname?: string;
		fromusr?: string;
	};
}

interface ForwardMessageContent {
	recordinfo: {
		title: string;
		desc: string;
		datalist: {
			dataitem: ForwardMessageRecord[];
		};
		favusername: string;
	};
}

type ForwardMessageProps = AppMessageProps<ForwardMessageEntity> &
	React.HTMLAttributes<HTMLElement>;

export const forwardMessageVariants = cva(
	[
		"py-2.5 px-3 w-fit max-w-[20em] rounded-lg",

		"leading-normal break-words text-pretty",
		"space-y-2 relative",
	],
	{
		variants: {
			variant: {
				default: [],
				referenced: [],
			},
			direction: {
				[MessageDirection.outgoing]: ["bg-[#95EB69] bubble-tail-r"],
				[MessageDirection.incoming]: ["bg-white bubble-tail-l"],
			},
		},
	},
);

export const forwardMessageRecordVariants = cva(
	[
		"pl-2 pr-2.5 py-1 text-sm leading-normal text-neutral-600 border-l-2 rounded",
		"max-h-[20em] overflow-hidden",
	],

	{
		variants: {
			variant: {
				default: [],
				referenced: [],
			},
			direction: {
				[MessageDirection.outgoing]: ["bg-white/25 border-white/55"],
				[MessageDirection.incoming]: [
					"bg-[rgba(222,222,222,0.3)] border-[rgba(193,193,193,0.6)]",
				],
			},
		},
	},
);

export default function ForwardMessage({
	message,
	variant = "default",
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
			message.message_entity.msg.appmsg.recorditem.replace(/&#x20;/g, " "), // 有些时候标签和属性之间的空格编码过
		),
	);

	if (variant === "default")
		return (
			<div
				className={forwardMessageVariants({
					variant,
					direction: message.direction,
					className,
				})}
				{...props}
			>
				<h4 className="font-medium">{title}</h4>
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
								<Record message={message} record={record} variant="abstract" />
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
								<DialogTitle>{title}</DialogTitle>
								<VisuallyHidden>
									<DialogDescription>{title}</DialogDescription>
								</VisuallyHidden>
							</DialogHeader>
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
										className="[&>img]:top-12.5"
									>
										<Record message={message} record={record} />
									</MessageBubbleGroup>
								))}
							</div>
						</ScrollArea>
					</DialogContent>
				</Dialog>
			</div>
		);

	return (
		<MessageInlineWrapper message={message} className={className} {...props}>
			<span>{title}</span>
		</MessageInlineWrapper>
	);
}
