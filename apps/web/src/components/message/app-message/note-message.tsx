import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import NoteDocument, {
	NoteInfoEntity,
} from "@/components/note-document/note-document";
import type { RecordType } from "@/components/record/record.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AttacheSuspenseQueryOptions } from "@/lib/fetchers";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import type { AppMessageTypeEnum } from "@/schema";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSuspenseQuery } from "@tanstack/react-query";
import { XMLParser } from "fast-xml-parser";
import { useMemo } from "react";

export interface NoteMessageEntity {
	type: AppMessageTypeEnum.NOTE;
	title: string;

	des: string;

	appattach: {
		totallen: number;
		attachid: string;
		emoticonmd5: string;
		fileext: string; // 注意：微信文件里存在 ..htm的文件，两个点
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbwidth: number;
		cdnthumbheight: number;
		cdnthumbaeskey: string;
		aeskey: string;
	};
	recorditem: string; // xml
}

/**
 * 一个笔记是一个 htm 文件，文件内除了文本，还包括 <object> 标签，
 * 标签内是图片、视频、音频等富媒体内容，
 */
interface NoteRecordEntity extends RecordType {
	"@_dataid": string;
	"@_datatype": number;
	"@_htmlid": "WeNoteHtmlFile" | string;
	datafmt: string;
}

type NoteMessageProps = AppMessageProps<NoteMessageEntity>;

export default function NoteMessage({
	message,
	variant = "default",
	...props
}: NoteMessageProps) {
	if (variant === "default") {
		return <NoteMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <NoteMessageAbstract message={message} {...props} />;
	}
}

function NoteMessageDefault({
	message,
	...props
}: Omit<NoteMessageProps, "variant">) {
	const xmlParser = new XMLParser({
		parseAttributeValue: true,
		ignoreAttributes: false,
		tagValueProcessor: (_, tagValue, jPath) => {
			if (
				jPath === "recordinfo.datalist.dataitem.datatitle" ||
				jPath === "recordinfo.datalist.dataitem.datadesc"
			) {
				return undefined; // 不解析
			}
			return tagValue; // 走默认的解析
		},
	});

	const noteContent = xmlParser.parse(
		decodeUnicodeReferences(
			message.message_entity.msg.appmsg.recorditem.replace(/&#x20;/g, " "), // 有些时候标签和属性之间的空格编码过
		),
	) as {
		recordinfo: NoteInfoEntity;
	};

	const htmlFile = noteContent.recordinfo.datalist.dataitem.find(
		(item) => item["@_htmlid"] === "WeNoteHtmlFile",
	);

	const { data: files } = useSuspenseQuery({
		...AttacheSuspenseQueryOptions({
			message,
			record: htmlFile,
			type: "text/html",
		}),
	});

	if (files.length === 0) return <div {...props}>没有找到对应的文件</div>;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<div
					className={cn(
						"relative max-w-[20em] flex flex-col rounded-lg bg-white",
					)}
					{...props}
				>
					<div className="p-3">
						{decodeUnicodeReferences(message.message_entity.msg.appmsg.des)
							.split("\n")
							.map((segment, index) => (
								<p key={index}>{segment}</p>
							))}
					</div>

					<div
						className={
							"px-3 py-1.5 text-sm leading-normal text-neutral-500 border-t border-neutral-200"
						}
					>
						笔记
					</div>
				</div>
			</DialogTrigger>

			<DialogContent
				showCloseButton={false}
				className="block p-0 gap-0 overflow-hidden h-[calc(100dvh-6rem)]"
			>
				<ScrollArea className="h-full  [&>div>div]:block! [&>div>div]:w-full [&>div>div]:max-w-full">
					<DialogHeader className="z-10 sticky top-0 p-4 bg-background">
						<DialogTitle>笔记</DialogTitle>
						<VisuallyHidden>
							<DialogDescription>笔记</DialogDescription>
						</VisuallyHidden>
					</DialogHeader>

					{useMemo(
						() => (
							<NoteDocument
								message={message}
								docUrl={files[0].src}
								noteInfo={noteContent.recordinfo}
								className="w-full max-w-full"
							/>
						),
						[files],
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

function NoteMessageAbstract({
	message,
	...props
}: Omit<NoteMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[笔记] {message.message_entity.msg.appmsg.des}
		</MessageInlineWrapper>
	);
}
