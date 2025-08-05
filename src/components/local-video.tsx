import { useQuery } from "@tanstack/react-query";
import type {
	ChatType,
	MicroVideoMessageType,
	VideoMessageType,
} from "@/lib/schema.ts";
import type React from "react";
import { VideoSuspenseQueryOptions } from "@/lib/fetchers";
import { useInViewport } from "@mantine/hooks";

interface LocalVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
	chat: ChatType;
	message: VideoMessageType | MicroVideoMessageType;
}

export default function LocalVideo({
	chat,
	message,
	...props
}: LocalVideoProps) {
	const { ref: videoRef, inViewport } = useInViewport();

	const { data } = useQuery({
		...VideoSuspenseQueryOptions({
			chat,
			message,
		}),
		enabled: inViewport,
	});

	return (
		<video
			ref={videoRef}
			src={data?.src}
			poster={data?.poster}
			controls
			// width={result?.[0]?.width}
			// height={result?.[0]?.height}
			{...props}
		/>
	);
}
