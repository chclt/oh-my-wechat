import FileTypeIcon from "@/components/filetype-icon";
import type { NoteMessageEntity } from "@/components/message/app-message/note-message";
import FileSizeFormatter from "@/components/ui/file-size-formatter";
import { getDataAdapter } from "@/lib/data-adapter";
import { cn } from "@/lib/utils";
import { AppMessageType, FileInfo, NoteAttachRecordEntity } from "@/schema";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface AttatchNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: AppMessageType<NoteMessageEntity>;
	recordEntity: NoteAttachRecordEntity;
}

export default function AttatchNoteRecord({
	message,
	recordEntity,
	className,
	...props
}: AttatchNoteRecordProps) {
	const [isAttachmentNotFound, setIsAttachmentNotFound] = useState(false);

	const { mutateAsync: download, data } = useMutation<FileInfo | null>({
		mutationKey: ["attach", message.chat_id, message.id],
		mutationFn: () => {
			return getDataAdapter()
				.getNoteMessageFile({
					accountId: "",
					message,
					record: recordEntity,
				})
				.then((res) => res.data ?? null);
		},
		onSuccess: (data) => {
			if (!data) {
				setIsAttachmentNotFound(true);
				return;
			}
			const downlaodLink = document.createElement("a");
			downlaodLink.href = data.src;
			downlaodLink.download = recordEntity.datatitle;
			downlaodLink.click();
		},
		onError: () => {
			setIsAttachmentNotFound(true);
		},
	});

	useEffect(() => {
		return () => {
			if (data) URL.revokeObjectURL(data.src);
		};
	});

	return (
		<div
			className={cn(
				"file-type-icon_trigger",
				"py-2.5 ps-2 pe-4 flex items-start bg-muted rounded-xs gap-2.5 cursor-pointer",
				className,
			)}
			{...props}
			onClick={() => {
				download();
			}}
		>
			<FileTypeIcon className="shrink-0" />

			<div>
				<h4 className="break-words font-medium">{recordEntity.datatitle}</h4>
				<small className={"text-neutral-500"}>
					<FileSizeFormatter bytes={recordEntity.datasize} />
				</small>
				{isAttachmentNotFound && (
					<p className="inline ml-2 text-destructive-foreground">
						<small>没找到对应文件</small>
					</p>
				)}
			</div>
		</div>
	);
}
