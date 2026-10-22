import { Dialog } from "@base-ui/react";
import { NoteEntity } from "@repo/types";
import type { GetRecordFileRequest } from "@repo/types/adapter";
import { useQuery } from "@tanstack/react-query";
import { XMLParser } from "fast-xml-parser";
import { Suspense, useMemo, useState } from "react";
import { useAccount } from "@/components/account-provider.tsx";
import { LoaderIcon } from "@/components/icon.tsx";
import NoteDocumentDialogContent from "@/components/note-document/note-document-dialog.tsx";
import NoteDocument from "@/components/note-document/note-document.tsx";
import { RecordFileQueryOptions } from "@/lib/fetchers/record.ts";
import queryClient from "@/lib/query-client.ts";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import type { NoteMessageProps } from "./types";

/**
 * 一个笔记是一个 htm 文件，文件内除了文本，还包括 <object> 标签，
 * 标签内是图片、视频、音频等富媒体内容，
 */

export function NoteMessageDefault({ message, ...props }: NoteMessageProps) {
	const { accountId } = useAccount();

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
	) as NoteEntity;

	const noteHtmlFile = noteContent.recordinfo.datalist.dataitem.find(
		(item) => item["@_htmlid"] === "WeNoteHtmlFile",
	);

	const NoteDocumentQueryOptions = {
		enabled: false,
		...RecordFileQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
			// 笔记 HTML 条目提供 dataid 和 datafmt，但 NoteRecordType 尚未单独描述它。
			record: noteHtmlFile as GetRecordFileRequest["record"],
			// type: "text/html",
		}),
	};
	const {
		data: noteDocumentFile,
		isPending: isNoteDocumentPending,
		isLoading: isNoteDocumentLoading,
	} = useQuery(NoteDocumentQueryOptions);
	const isNoteDocumentNotExists =
		!isNoteDocumentPending && !noteDocumentFile ? true : undefined;
	const [isNoteDocumentDialogOpen, setIsNoteDocumentDialogOpen] =
		useState(false);
	const handleOpenNoteDocument = () => {
		queryClient
			.ensureQueryData(NoteDocumentQueryOptions)
			.then((noteDocumentFile) => {
				if (noteDocumentFile) {
					setIsNoteDocumentDialogOpen(true);
				}
			});
	};

	const renderNoteDocument = useMemo(() => {
		if (!noteDocumentFile) return null;
		return (
			<NoteDocument
				message={message}
				docUri={noteDocumentFile.uri}
				noteEntity={noteContent}
			/>
		);
	}, [noteDocumentFile]);

	return (
		<Dialog.Root
			open={isNoteDocumentDialogOpen}
			onOpenChange={(open) => {
				if (open) {
					handleOpenNoteDocument();
				} else {
					setIsNoteDocumentDialogOpen(false);
				}
			}}
		>
			<Dialog.Trigger
				render={<div />}
				nativeButton={false}
				className={cn(
					"appearance-none text-start cursor-pointer",
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
						"px-3 py-1.5 text-sm leading-normal text-muted-foreground border-t"
					}
				>
					<div className="inline">
						<span>笔记</span>
					</div>

					{isNoteDocumentLoading ? (
						<div className="float-end size-5 relative">
							<LoaderIcon
								aria-label="加载中"
								className="absolute inset-0.5 size-4 text-muted-foreground/80 animate-spin"
							/>
						</div>
					) : (
						isNoteDocumentNotExists && (
							<div className="float-end text-destructive-foreground/60">
								没有找到文件
							</div>
						)
					)}
				</div>
			</Dialog.Trigger>
			<NoteDocumentDialogContent>
				<Suspense>{renderNoteDocument}</Suspense>
			</NoteDocumentDialogContent>
		</Dialog.Root>
	);
}
