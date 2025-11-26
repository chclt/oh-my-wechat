import { LoaderIcon } from "@/components/icon";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import NoteDocument from "@/components/note-document/note-document";
import dialogClasses from "@/components/ui/dialog.module.css";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { AttachQueryOptions } from "@/lib/fetchers";
import queryClient from "@/lib/query-client.ts";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import { AppMessageTypeEnum, NoteEntity } from "@/schema";
import { Dialog, ScrollArea } from "@base-ui-components/react";
import { useQuery } from "@tanstack/react-query";
import { XMLParser } from "fast-xml-parser";
import { Suspense, useMemo, useRef, useState } from "react";

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
	) as NoteEntity;

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
				message={message}
				docUrl={noteDocumentFile.src}
				noteEntity={noteContent}
			/>
		);
	}, [noteDocumentFile]);

	const noteDocumentDialogPopupRef = useRef<HTMLDivElement>(null);

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
			<Dialog.Portal>
				<Dialog.Backdrop
					className={cn(
						dialogClasses.Backdrop,
						"backdrop-blur-[2px]",
						"transition-[backdrop-filter,opacity]",
						"ease-[var(--ease-out-fast)] duration-[600ms]",
						"data-[starting-style]:backdrop-blur-0",
						"data-[ending-style]:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] data-[ending-style]:duration-[200ms]",
						"data-[ending-style]:backdrop-blur-0",
					)}
				/>
				<Dialog.Viewport className={dialogClasses.Viewport}>
					<ScrollArea.Root
						className={scrollAreaClasses.Viewport}
						style={{ position: undefined }}
					>
						<ScrollArea.Viewport className={scrollAreaClasses.Viewport}>
							<ScrollArea.Content
								className={cn(scrollAreaClasses.Content, "overflow-hidden")}
							>
								<Dialog.Popup
									ref={noteDocumentDialogPopupRef}
									initialFocus={noteDocumentDialogPopupRef}
									className={cn(
										dialogClasses.Popup,
										"relative w-md max-w-[calc(100%-2rem)] mx-auto my-18 rounded-xl bg-background overflow-hidden",
										// "shadow-[0_10px_64px_-10px_rgba(36,40,52,0.2),0_0.25px_0_1px_rgba(229,231,235,1)]",
										"ease-[cubic-bezier(0.45,1.005,0,1.005)] duration-[700ms]",
										"data-[starting-style]:opacity-100 data-[starting-style]:translate-y-[100dvh]",
										"data-[ending-style]:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] data-[ending-style]:duration-[200ms]",
										"data-[ending-style]:opacity-100 data-[ending-style]:translate-y-[max(100dvh,100%)]",
									)}
								>
									<div className="z-10 sticky top-0 p-4 bg-background">
										<Dialog.Title className={dialogClasses.Title}>
											笔记
										</Dialog.Title>
									</div>

									<Suspense>{renderNoteDocument}</Suspense>
								</Dialog.Popup>
							</ScrollArea.Content>
						</ScrollArea.Viewport>
						<ScrollArea.Scrollbar
							className={cn(scrollAreaClasses.Scrollbar, "absolute rounded-xl")}
						>
							<ScrollArea.Thumb className={scrollAreaClasses.Thumb} />
						</ScrollArea.Scrollbar>
					</ScrollArea.Root>
				</Dialog.Viewport>
			</Dialog.Portal>
		</Dialog.Root>
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
