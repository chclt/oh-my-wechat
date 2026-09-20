import type { MicroVideoMessageType, VideoMessageType } from "@repo/types";
import type { CSSProperties } from "react";

export function getVideoMessageSizeStyle(
	message: VideoMessageType | MicroVideoMessageType,
): CSSProperties | undefined {
	const video = message.message_entity.msg.videomsg;
	const width = Number(video["@_cdnthumbwidth"]);
	const height = Number(video["@_cdnthumbheight"]);
	if (!(width > 0 && height > 0)) return;

	// Keep the same box while the file query, poster and video metadata load.
	return { width: "20em", height: "auto", aspectRatio: width / height };
}

export const videoMessageClassName =
	"max-w-[20em] min-w-32 min-h-32 rounded-lg overflow-hidden";
