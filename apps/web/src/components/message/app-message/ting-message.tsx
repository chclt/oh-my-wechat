import Image from "@/components/image.tsx";
import Link from "@/components/link.tsx";
import LocalImage from "@/components/local-image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import type { AppMessageTypeEnum } from "@/schema";

export interface TingMessageEntity {
	type: AppMessageTypeEnum.TING;
	title: string;
	des: string;

	url: string;
	lowurl: string;
	dataurl?: string;
	lowdataurl?: string;
	songalbumurl: string;
	appattach: {
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbwidth: number;
		cdnthumbheight: number;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: number;
		filekey: string;
		uploadstatus: number;
	};
	md5: string;
	musicShareItem?: {
		mid: string;
		mvSingerName: string;
	};
	tingListenItem: {
		listenId: string;
		type: number;
		listenItem: string;
	};
	"@_appid": string;
	"@_sdkver": string;
}

type TingMessageProps = AppMessageProps<TingMessageEntity>;

export default function TingMessage({
	message,
	variant = "default",
	...props
}: TingMessageProps) {
	if (variant === "default") {
		return <TingMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <TingMessageAbstract message={message} {...props} />;
	}
}

function TingMessageDefault({
	message,
	...props
}: Omit<TingMessageProps, "variant">) {
	return (
		<Link href={message.message_entity.msg.appmsg.url}>
			<div
				className={cn(
					"relative max-w-[20em] h-24 rounded-2xl overflow-hidden bg-white",
				)}
				{...props}
			>
				{message.message_entity.msg.appmsg.appattach.filekey ? (
					<LocalImage
						message={message}
						size="origin"
						domain="opendata"
						className={"absolute inset-0 w-full h-full object-cover"}
					/>
				) : message.message_entity.msg.appmsg.songalbumurl ? (
					<Image
						src={message.message_entity.msg.appmsg.songalbumurl}
						className={"absolute inset-0 w-full h-full object-cover"}
					/>
				) : null}

				<div
					className={
						"h-full relative flex items-center gap-4 pe-6 bg-white/60 backdrop-blur-xl"
					}
				>
					{message.message_entity.msg.appmsg.appattach.filekey ? (
						<LocalImage
							message={message}
							size="origin"
							domain="opendata"
							className={"h-full w-auto rounded-lg"}
						/>
					) : message.message_entity.msg.appmsg.songalbumurl ? (
						<Image
							src={message.message_entity.msg.appmsg.songalbumurl}
							className={"h-full w-auto rounded-lg"}
						/>
					) : null}

					<div className={"flex flex-col"}>
						<h4 className="break-words font-medium line-clamp-2">
							{decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
						</h4>
						<p
							className={
								"mt-1 text-sm text-secondary-foreground line-clamp-1 break-all"
							}
						>
							{decodeUnicodeReferences(message.message_entity.msg.appmsg.des)}
						</p>
					</div>
				</div>
			</div>
		</Link>
	);
}

function TingMessageAbstract({
	message,
	...props
}: Omit<TingMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			{message.message_entity.msg.appmsg.musicShareItem ? "[音乐]" : "[音频]"}{" "}
			{decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
