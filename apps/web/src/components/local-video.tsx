import { useQuery } from "@tanstack/react-query";
import type { MicroVideoMessageType, VideoMessageType } from "@/schema";
import type React from "react";
import { VideoSuspenseQueryOptions } from "@/lib/fetchers";
import { useInViewport } from "@mantine/hooks";

interface LocalVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
	message: VideoMessageType | MicroVideoMessageType;
}

export default function LocalVideo({ message, ...props }: LocalVideoProps) {
	const { ref: videoRef, inViewport } = useInViewport();

	const { data } = useQuery({
		...VideoSuspenseQueryOptions({
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
