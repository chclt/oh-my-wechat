import LocalImage from "@/components/local-image.tsx";
import LocalVideo from "@/components/local-video.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { MessageProp } from "@/components/message/message.tsx";
import { cn } from "@/lib/utils.ts";
import type { VideoMessageType } from "@/schema";
import type React from "react";

type VideoMessageProps = MessageProp<
	VideoMessageType,
	"viewer_detail" | "viewer_thumb"
> &
	React.HTMLAttributes<HTMLElement>;

export interface VideoMessageEntity {
	msg: {
		videomsg: {
			"@_length": string;
			"@_playlength": string;
			"@_offset": string;
			"@_rawoffset": string;
			"@_fromusername": string;
			"@_status": string;
			"@_cameratype": string;
			"@_source": string;
			"@_aeskey": string;

			"@_cdnvideourl": string;

			"@_cdnthumburl": string;
			"@_cdnthumblength": string;
			"@_cdnthumbwidth": string;
			"@_cdnthumbheight": string;
			"@_cdnthumbaeskey": string;

			"@_encryver": string;
			"@_fileparam": string;
			"@_md5": string;
			"@_newmd5": string;
			"@_filekey": `${string}_${string}_${string}`;
			"@_uploadcontinuecount": string;

			"@_rawlength": string;
			"@_rawmd5": string;
			"@_cdnrawvideourl": string;
			"@_cdnrawvideoaeskey": string;

			"@_overwritemsgcreatetime": string;
			"@_overwritenewmsgid": string;

			"@_videouploadtoken": string;
			"@_isplaceholder": string;
			"@_rawuploadcontinuecount": string;
		};
	};
}

export default function VideoMessage({
	message,
	variant = "default",
	...props
}: VideoMessageProps) {
	const chat = message.chat;
	if (variant === "default") {
		return <VideoMessageDefault message={message} {...props} />;
	} else if (variant === "viewer_detail") {
		return (
			<div {...props}>
				<LocalVideo chat={chat!} message={message} className={""} />
			</div>
		);
	} else if (variant === "viewer_thumb") {
		return (
			<div {...props}>
				<LocalImage
					chat={chat!}
					message={message}
					domain="video"
					size="thumb"
					alt={""}
					className={""}
				/>
			</div>
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return <VideoMessageAbstract message={message} {...props} />;
	}
}

function VideoMessageDefault({
	message,
	...props
}: Omit<VideoMessageProps, "variant">) {
	const chat = message.chat;

	return (
		<div
			className={cn(
				"max-w-[20em] min-w-32 min-h-32 rounded-lg overflow-hidden ",
				["mask-bubble-tail-r mr-[-5px]", "mask-bubble-tail-l ml-[-5px]"][
					message.direction
				],
			)}
			onClick={() => {
				//
			}}
			{...props}
		>
			<div className={"relative"}>
				<LocalVideo
					chat={chat!}
					message={message}
					controls
					className={"min-w-32 min-h-32 object-contain bg-white"}
				/>

				<div
					className={
						"hidden absolute top-0 right-0 bottom-0 left-[5px] flex justify-center items-center"
					}
				>
					<div className={"size-8 [&_svg]:size-full"}>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M19.5 9.40192C21.5 10.5566 21.5 13.4434 19.5 14.5981L10.5 19.7942C8.5 20.9489 6 19.5056 6 17.1962L6 6.80385C6 4.49445 8.5 3.05107 10.5 4.20577L19.5 9.40192Z"
								fill="white"
							/>
						</svg>
					</div>
				</div>
				<div
					className={cn(
						"hidden absolute bottom-2 text-sm text-white",
						["left-4", "left-[calc(5px+1rem)]"][message.direction],
					)}
				>
					{(Number.parseInt(
						message.message_entity.msg.videomsg["@_playlength"],
					) /
						60) |
						0}
					:
					{(
						Number.parseInt(
							message.message_entity.msg.videomsg["@_playlength"],
						) % 60
					)
						.toString()
						.padStart(2, "0")}
				</div>
			</div>
		</div>
	);
}

function VideoMessageAbstract({
	message,
	...props
}: Omit<VideoMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			<span>[视频]</span>
		</MessageInlineWrapper>
	);
}
