import { useMutation } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import FileTypeIcon from "@/components/filetype-icon";
import { LoaderIcon } from "@/components/icon";
import FileSizeFormatter from "@/components/ui/file-size-formatter";
import { getDataAdapter } from "@/lib/data-adapter";
import { downloadMessageFile } from "@/lib/download-message-file";
import { MessageAttachQueryOptions } from "@/lib/fetchers";
import queryClient from "@/lib/query-client";
import { cn, decodeUnicodeReferences } from "@/lib/utils";
import { AttachMessageProps } from "./types";

export function AttachMessageDefault({
	message,
	...props
}: AttachMessageProps) {
	const { accountId } = useAccount();

	const {
		mutate: download,
		data,
		isPending,
		isError,
		isSuccess,
	} = useMutation({
		mutationFn: async () => {
			const adapter = getDataAdapter();
			const attachment = await queryClient.fetchQuery({
				...MessageAttachQueryOptions({
					account: { id: accountId },
					chat: { id: message.chat_id },
					message,
				}),
				staleTime: 0,
			});
			if (!attachment) return null;
			await downloadMessageFile(
				adapter,
				attachment.uri,
				decodeUnicodeReferences(message.message_entity.msg.appmsg.title),
			);
			return attachment;
		},
	});
	const failure = isError
		? "附件读取或解密失败，点击重试"
		: isSuccess && data === null
			? "没找到对应文件，点击重试"
			: undefined;

	return (
		<button
			type="button"
			className={cn(
				"file-type-icon_trigger", // TODO: refactor
				"text-start",
				"max-w-80 py-2.5 pr-2 pl-4 flex items-start bg-white space-x-2.5 rounded-xl cursor-pointer",
			)}
			{...props}
			disabled={isPending}
			aria-busy={isPending}
			onClick={() => {
				if (!isPending) download();
			}}
		>
			<span>
				<span className="block break-words font-medium">
					{decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
				</span>
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
					{isPending ? (
						<span className="ms-2 inline size-4 relative">
							<LoaderIcon
								aria-label="正在准备附件"
								className="absolute inset-0.5 size-3 text-muted-foreground/80 animate-spin"
							/>
						</span>
					) : (
						failure && (
							<span role="alert" className="ms-2 text-destructive-foreground">
								{failure}
							</span>
						)
					)}
				</small>
			</span>

			{/*<img src={filetype_any} alt={"文件"} />*/}
			<FileTypeIcon className="shrink-0" />
		</button>
	);
}
