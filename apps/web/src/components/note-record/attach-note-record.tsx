import {
	AttachNoteRecordType,
	FileInfo,
	NoteOpenMessageEntity,
	OpenMessageType,
} from "@repo/types";
import { useMutation } from "@tanstack/react-query";
import FileTypeIcon from "@/components/filetype-icon.tsx";
import { LoaderIcon } from "@/components/icon";
import FileSizeFormatter from "@/components/ui/file-size-formatter.tsx";
import { getDataAdapter } from "@/lib/data-adapter.ts";
import { downloadMessageFile } from "@/lib/download-message-file";
import { cn } from "@/lib/utils.ts";
import { Route } from "@/routes/$accountId/route.tsx";

interface AttachNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<NoteOpenMessageEntity>;
	recordEntity: AttachNoteRecordType;
}

export default function AttachNoteRecord({
	message,
	recordEntity,
	className,
	...props
}: AttachNoteRecordProps) {
	const { accountId } = Route.useParams();

	const {
		mutate: download,
		data,
		isPending,
		isError,
		isSuccess,
	} = useMutation<FileInfo | null>({
		mutationKey: ["attach", message.chat_id, message.id],
		mutationFn: async () => {
			const adapter = getDataAdapter();
			const { data } = await adapter.getRecordFile({
				account: { id: accountId },
				chat: { id: message.chat_id },
				message,
				record: recordEntity,
			});
			if (data)
				await downloadMessageFile(adapter, data.uri, recordEntity.datatitle);
			return data ?? null;
		},
	});

	const failure = isError
		? "附件读取或解密失败，点击重试"
		: isSuccess && data === null
			? "没找到对应文件，点击重试"
			: undefined;

	return (
		<div
			className={cn(
				"file-type-icon_trigger",
				"py-2.5 ps-2 pe-4 flex items-start bg-muted rounded-xs gap-2.5 cursor-pointer",
				className,
			)}
			{...props}
			aria-busy={isPending}
			aria-disabled={isPending}
			onClick={() => {
				if (!isPending) download();
			}}
		>
			<FileTypeIcon className="shrink-0" />

			<div>
				<h4 className="break-words font-medium">{recordEntity.datatitle}</h4>
				<small className={"text-neutral-500"}>
					<FileSizeFormatter bytes={recordEntity.datasize} />
				</small>
				{isPending ? (
					<LoaderIcon
						aria-label="正在准备附件"
						className="inline ms-2 size-3 animate-spin"
					/>
				) : failure ? (
					<p role="alert" className="inline ml-2 text-destructive-foreground">
						<small>{failure}</small>
					</p>
				) : null}
			</div>
		</div>
	);
}
