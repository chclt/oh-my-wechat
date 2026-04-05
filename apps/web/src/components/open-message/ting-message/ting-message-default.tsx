import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import Image from "@/components/image.tsx";
import Link from "@/components/link.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type { TingMessageProps } from "./types";

export function TingMessageDefault({
	accountId,
	message,
	...props
}: TingMessageProps) {
	const { ref: imageRef, inViewport } = useInViewport();

	const { data: image } = useQuery({
		...MessageImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
			domain: "opendata",
		}),
		enabled: inViewport,
	});

	return (
		<Link href={message.message_entity.msg.appmsg.url}>
			<div
				className={cn(
					"relative max-w-[20em] h-24 rounded-2xl overflow-hidden bg-white",
				)}
				{...props}
			>
				{message.message_entity.msg.appmsg.appattach.filekey ? (
					<AutoResolutionFallbackImage
						ref={imageRef}
						image={image}
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
						<AutoResolutionFallbackImage
							ref={imageRef}
							image={image}
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
