import { AttachQueryOptions } from "@/lib/fetchers";
import queryClient from "@/lib/query-client";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import type { AppMessageType, MessageType, NoteEntity } from "@/schema";
import { Dialog } from "@base-ui-components/react";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { Suspense, useMemo, useState } from "react";
import { LoaderIcon } from "../icon";
import { NoteMessageEntity } from "../message/app-message/note-message";
import NoteDocument from "../note-document/note-document";
import NoteDocumentDialogContent from "../note-document/note-document-dialog";
import { NoteMessageRecordType } from "@/schema/message-record.ts";

interface NoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: MessageType;
	record: NoteMessageRecordType;
	variant: "default" | string;
}

export default function NoteRecord({
	message,
	record,
	variant = "default",
	...props
}: NoteRecordProps) {
	if (variant === "default")
		return <NoteRecordDefault message={message} record={record} {...props} />;

	return (
		<p className="inline" {...props}>
			[笔记] {record.datadesc}
		</p>
	);
}

function NoteRecordDefault({
	message,
	record,
	...props
}: Omit<NoteRecordProps, "variant">) {
	const noteContent = record.recordxml as unknown as NoteEntity;

	const htmlFile = noteContent.recordinfo.datalist.dataitem.find(
		(item) => item["@_htmlid"] === "WeNoteHtmlFile",
	);

	// TODO: 新的获取笔记内容的方法，而不是拿 ObjectURL 再 fetch
	const NoteDocumentQueryOptions = {
		enabled: false,
		...AttachQueryOptions({
			message,
			record: htmlFile,
			type: "text/html",
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
				message={message as AppMessageType<NoteMessageEntity>}
				docUrl={noteDocumentFile.src}
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
				className={cn(
					"appearance-none text-start cursor-pointer",
					"relative max-w-[20em] flex flex-col rounded-lg bg-white",
				)}
				{...props}
			>
				<div className="p-3">
					{decodeUnicodeReferences(record.datadesc)
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
