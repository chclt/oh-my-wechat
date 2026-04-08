import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAccount } from "@/components/account-provider.tsx";
import FileTypeIcon from "@/components/filetype-icon";
import { LoaderIcon } from "@/components/icon";
import FileSizeFormatter from "@/components/ui/file-size-formatter";
import { MessageAttachQueryOptions } from "@/lib/fetchers";
import queryClient from "@/lib/query-client";
import { cn, decodeUnicodeReferences } from "@/lib/utils";
import { AttachMessageProps } from "./types";

export function AttachMessageDefault({
	message,
	...props
}: AttachMessageProps) {
	const { accountId } = useAccount();

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
