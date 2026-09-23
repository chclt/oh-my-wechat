import { VideoMessageDefault } from "../video-message/video-message-default.tsx";
import type { MicroVideoMessageProps } from "./types.ts";

export function MicroVideoMessageDefault(props: MicroVideoMessageProps) {
	return <VideoMessageDefault {...props} />;
}
