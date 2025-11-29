import { FileBendSolid } from "@/components/central-icon.tsx";
import FileTypeIcon from "@/components/filetype-icon.tsx";
import { LoaderIcon } from "@/components/icon.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import FileSizeFormatter from "@/components/ui/file-size-formatter.tsx";
import { MessageAttachQueryOptions } from "@/lib/fetchers";
import queryClient from "@/lib/query-client.ts";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import { Route } from "@/routes/$accountId/route.tsx";
import { AttachOpenMessageEntity } from "@/schema/open-message.ts";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

type AttachMessageProps = OpenMessageProps<AttachOpenMessageEntity>;

export default function AttachMessage({
	message,
	variant = "default",
	...props
}: AttachMessageProps) {
	if (variant === "default") {
		return <AttachMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <AttachMessageAbstract message={message} {...props} />;
	}
}

function AttachMessageDefault({
	message,
	...props
}: Omit<AttachMessageProps, "variant">) {
	const { accountId } = Route.useParams();

	const AttachmentQueryOptions = {
		enabled: false,
		...MessageAttachQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
		}),
	};
	const {
		data: attachmentFile,
		isPending: isAttachmentFilePending,
		isLoading: isAttachmentFileLoading,
	} = useQuery(AttachmentQueryOptions);
	const isAttachmentNotExists =
		!isAttachmentFilePending && !attachmentFile ? true : undefined;
	const handleDownloadAttachment = () => {
		queryClient
			.ensureQueryData(AttachmentQueryOptions)
			.then((attachmentFile) => {
				if (!attachmentFile) return;

				const downlaodLink = document.createElement("a");
				downlaodLink.href = attachmentFile.src;
				downlaodLink.download = decodeUnicodeReferences(
					message.message_entity.msg.appmsg.title,
				);
				downlaodLink.click();
			});
	};

	useEffect(() => {
		return () => {
			if (attachmentFile) {
				URL.revokeObjectURL(attachmentFile.src);
			}
		};
	});

	return (
		<button
			className={cn(
				"file-type-icon_trigger", // TODO: refactor
				"text-start",
				"max-w-80 py-2.5 pr-2 pl-4 flex items-start bg-white space-x-2.5 rounded-xl cursor-pointer",
			)}
			{...props}
			onClick={() => {
				handleDownloadAttachment();
			}}
		>
			<div>
				<h4 className="break-words font-medium">
					{decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
				</h4>
				<small className={"text-neutral-500"}>
					<FileSizeFormatter
						bytes={
							Array.isArray(
								message.message_entity.msg.appmsg.appattach.totallen,
							)
								? message.message_entity.msg.appmsg.appattach.totallen[0]
								: message.message_entity.msg.appmsg.appattach.totallen
						}
					/>
					{isAttachmentFileLoading ? (
						<span className="ms-2 inline size-4 relative">
							<LoaderIcon
								aria-label="加载中"
								className="absolute inset-0.5 size-3 text-muted-foreground/80 animate-spin"
							/>
						</span>
					) : (
						isAttachmentNotExists && (
							<span className="ms-2 text-destructive-foreground">
								没找到对应文件
							</span>
						)
					)}
				</small>
			</div>

			{/*<img src={filetype_any} alt={"文件"} />*/}
			<FileTypeIcon className="shrink-0" />
		</button>
	);
}

function AttachMessageAbstract({
	message,
	...props
}: Omit<AttachMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			<span className="-ml-1 relative inline-block size-[1.5em] align-bottom text-black/45 [&_svg]:inline [&_svg]:absolute [&_svg]:inset-0 [&_svg]:m-auto [&_svg]:size-[1.25em] [&_svg]:rounded-[3px] me-[0.15em]">
				<FileBendSolid />
			</span>
			[文件] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
