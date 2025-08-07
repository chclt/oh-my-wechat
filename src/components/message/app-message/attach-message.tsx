import { FileBendSolid } from "@/components/central-icon.tsx";
import FileTypeIcon from "@/components/filetype-icon.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import { getDataAdapter } from "@/lib/data-adapter.ts";
import type { AppMessageTypeEnum, FileInfo } from "@/schema";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export interface AttachMessageEntity {
	type: AppMessageTypeEnum.ATTACH;
	title: string;
	des: string;
	appattach: {
		totallen: number | number[];
		fileext: string;
		attachid: string;
		cdnattachurl: string;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: number;
		filekey: `${string}_${string}_${string}`;
		overwrite_newmsgid: string;
		fileuploadtoken: string;
	};
	md5: string;
	recorditem: string;
	uploadpercent: number;
	"@_appid": string;
	"@_sdkver": string;
}

type AttachMessageProps = AppMessageProps<AttachMessageEntity>;

export default function AttachMessage({
	message,
	variant = "default",
	...props
}: AttachMessageProps) {
	const chat = message.chat;

	const [isAttachmentNotFound, setIsAttachmentNotFound] = useState(false);

	const { mutateAsync: download, data } = useMutation<FileInfo[]>({
		mutationKey: ["attache", chat.id, message.id],
		mutationFn: () => {
			return getDataAdapter().getAttache({ chat, message });
		},
		onSuccess: (data) => {
			const downlaodLink = document.createElement("a");
			downlaodLink.href = data[0].src;
			downlaodLink.download = decodeUnicodeReferences(
				message.message_entity.msg.appmsg.title,
			);
			downlaodLink.click();
		},
		onError: () => {
			setIsAttachmentNotFound(true);
		},
	});

	useEffect(() => {
		return () => {
			if (data?.length)
				data.map((file) => {
					URL.revokeObjectURL(file.src);
				});
		};
	});

	if (variant === "default")
		return (
			<div
				className={cn(
					"file-type-icon_trigger",
					"max-w-80 py-2.5 pr-2 pl-4 flex items-start bg-white space-x-2.5 rounded-xl cursor-pointer",
				)}
				{...props}
				onClick={() => {
					download();
				}}
			>
				<div>
					<h4 className="break-words font-medium">
						{decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
					</h4>
					<small className={"text-neutral-500"}>
						{(
							Math.round(
								((Array.isArray(
									message.message_entity.msg.appmsg.appattach.totallen,
								)
									? message.message_entity.msg.appmsg.appattach.totallen[0]
									: message.message_entity.msg.appmsg.appattach.totallen) /
									1024 /
									1024) *
									100,
							) / 100
						).toFixed(2)}
						MB
					</small>
					{isAttachmentNotFound && (
						<p className="inline ml-2 text-red-500">
							<small>没找到对应文件</small>
						</p>
					)}
				</div>

				{/*<img src={filetype_any} alt={"文件"} />*/}
				<FileTypeIcon className="shrink-0" />
			</div>
		);
	return (
		<MessageInlineWrapper message={message} {...props}>
			<span className="-ml-1 relative inline-block size-[1.5em] align-bottom text-black/45 [&_svg]:inline [&_svg]:absolute [&_svg]:inset-0 [&_svg]:m-auto [&_svg]:size-[1.25em] [&_svg]:rounded-[3px] me-[0.15em]">
				<FileBendSolid />
			</span>
			[文件] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
