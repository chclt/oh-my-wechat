import LocalImage from "@/components/local-image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { MessageProp } from "@/components/message/message.tsx";
import User from "@/components/user.tsx";
import { cn } from "@/lib/utils.ts";
import type { ImageMessageType } from "@/schema";
import type React from "react";

type ImageMessageProps = MessageProp<
	ImageMessageType,
	"viewer_detail" | "viewer_thumb"
> &
	React.HTMLAttributes<HTMLElement>;

export interface ImageMessageEntity {
	msg: {
		img: {
			"@_hdlength": string;
			"@_length": string;
			"@_aeskey": string;
			"@_encryver": "0" | "1";
			"@_md5": string;
			"@_filekey": `${string}_${string}_${string}`;
			"@_uploadcontinuecount": string;
			"@_imgsourceurl": string;
			"@_hevc_mid_size": string;

			"@_cdnbigimgurl": "";

			"@_cdnmidimgurl": string;
			"@_cdnmidheight": string;
			"@_cdnmidwidth": string;

			"@_cdnhdheight": string;
			"@_cdnhdwidth": string;

			"@_cdnthumburl": string;
			"@_cdnthumblength": string;
			"@_cdnthumbwidth": string;
			"@_cdnthumbheight": string;
			"@_cdnthumbaeskey": string;
		};
		appinfo: {
			appid: "";
			appname: "";
			version: 0;
			isforceupdate: 1;
			mediatagname: "";
			messageext: "";
			messageaction: "";
		};
		MMAsset: {
			m_assetUrlForSystem: string;
			m_isNeedOriginImage: 0 | 1;
			m_isFailedFromIcloud: 0 | 1;
			m_isLoadingFromIcloud: 0 | 1;
		};
	};
}

export default function ImageMessage({
	message,
	variant = "default",
	...props
}: ImageMessageProps) {
	const chat = message.chat;

	if (variant === "default") {
		return <ImageMessageDefault message={message} {...props} />;
	} else if (variant === "referenced") {
		return <ImageMessageReferenced message={message} {...props} />;
	} else if (variant === "viewer_detail") {
		// TODO
	} else if (variant === "viewer_thumb") {
		return (
			<div {...props}>
				<LocalImage
					chat={chat}
					message={message}
					size={variant === "viewer_thumb" ? "thumb" : "origin"}
					alt={""}
				/>
			</div>
		);
	} else if (variant === "abstract") {
		return <ImageMessageAbstract message={message} {...props} />;
	}
}

function ImageMessageDefault({
	message,
	...props
}: Omit<ImageMessageProps, "variant">) {
	const chat = message.chat;

	return (
		<div
			className={cn("rounded-lg overflow-hidden")}
			onClick={() => {
				//
			}}
			{...props}
		>
			<LocalImage
				chat={chat}
				message={message}
				size="origin"
				alt={"图片"}
				className={
					"max-w-[16em] max-h-128 min-w-32 min-h-16 object-contain bg-white"
				}
			/>
		</div>
	);
}

function ImageMessageAbstract({
	message,
	...props
}: Omit<ImageMessageProps, "variant">) {
	const chat = message.chat;

	return (
		<MessageInlineWrapper message={message} {...props}>
			<LocalImage
				chat={chat}
				message={message}
				size="thumb"
				alt={""}
				className={
					"me-1 inline align-middle min-w-4 min-h-4 size-4 object-cover rounded-[3px]"
				}
			/>
			[图片]
		</MessageInlineWrapper>
	);
}

function ImageMessageReferenced({
	message,
	...props
}: Omit<ImageMessageProps, "variant">) {
	const chat = message.chat;

	return (
		<div {...props}>
			{message.from && (
				<>
					<User user={message.from} variant="inline" />
					<span>: </span>
				</>
			)}
			<LocalImage
				chat={chat}
				message={message}
				size="origin"
				alt={""}
				className={
					"inline mx-[0.2em] align-top max-w-16 max-h-16 rounded overflow-hidden"
				}
			/>
		</div>
	);
}
