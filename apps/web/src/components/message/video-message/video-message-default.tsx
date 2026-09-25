import { useInViewport } from "@mantine/hooks";
import {
	MessageDirection,
	type MicroVideoMessageType,
	type VideoMessageType,
} from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAccount } from "@/components/account-provider.tsx";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
import { MessageVideoQueryOptions } from "@/lib/fetchers";
import { cn } from "@/lib/utils.ts";
import { getVideoPoster } from "@/lib/video-poster.ts";
import { getVideoMessageSizeStyle } from "./libs.ts";
import type { VideoMessageProps } from "./types.ts";
import classes from "./video-message.module.css";

export function VideoMessageDefault({
	message,
	className,
	...props
}: Omit<VideoMessageProps, "message"> & {
	message: VideoMessageType | MicroVideoMessageType;
}) {
	const { accountId } = useAccount();
	const { ref: videoRef, inViewport } = useInViewport();
	const queryOptions = MessageVideoQueryOptions({
		account: { id: accountId },
		chat: { id: message.chat_id },
		message,
	});
	const { data: video } = useQuery({
		...queryOptions,
		enabled: inViewport,
	});
	const { src: videoSrc } = useResolveMessageFile(video?.uri);
	const { src: coverSrc } = useResolveMessageFile(video?.cover?.uri);
	const { data: firstFrame } = useQuery({
		queryKey: [...queryOptions.queryKey, "first-frame"],
		queryFn: ({ signal }) => getVideoPoster(videoSrc!, signal),
		// An existing cover must not fall back to extraction when it fails to load.
		enabled: inViewport && !!videoSrc && !video?.cover,
	});
	const [firstFrameSrc, setFirstFrameSrc] = useState<string>();
	useEffect(() => {
		if (!firstFrame) {
			setFirstFrameSrc(undefined);
			return;
		}
		const src = URL.createObjectURL(firstFrame);
		setFirstFrameSrc(src);
		return () => URL.revokeObjectURL(src);
	}, [firstFrame]);
	const posterSrc = video?.cover ? coverSrc : firstFrameSrc;

	return (
		<div
			{...props}
			className={cn(
				classes.root,
				message.direction === MessageDirection.outgoing
					? "bubble-tail-r"
					: "bubble-tail-l",
				className,
			)}
		>
			<div className={classes.body}>
				<video
					ref={videoRef}
					src={videoSrc}
					poster={posterSrc}
					controls
					style={getVideoMessageSizeStyle(message)}
					className={classes.video}
				/>

				<div
					className={"hidden absolute inset-0 flex justify-center items-center"}
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
				<div className="hidden absolute bottom-2 left-4 text-sm text-white">
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
			{posterSrc && (
				<div className={classes.tail} aria-hidden="true">
					<div
						className={classes.decoration}
						style={{ backgroundImage: `url("${posterSrc}")` }}
					/>
				</div>
			)}
		</div>
	);
}
