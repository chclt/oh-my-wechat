import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import Link from "@/components/link.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type { MusicMessageProps } from "./types";
import { useAccount } from "@/components/account-provider.tsx";

export function MusicMessageDefault({ message, ...props }: MusicMessageProps) {
	const { accountId } = useAccount();

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
					"relative max-w-[20em] rounded-2xl overflow-hidden bg-white",
				)}
				{...props}
			>
				<AutoResolutionFallbackImage
					ref={imageRef}
					image={image}
					className={"absolute inset-0 w-full h-full object-cover"}
				/>
				<div
					className={
						"relative p-4 flex items-center bg-white/60 backdrop-blur-xl"
					}
				>
					<div
						className={
							"relative shrink-0 size-16 before:content-[''] before:absolute before:-inset-8 before:rounded-full before:bg-black"
						}
					>
						<AutoResolutionFallbackImage
							ref={imageRef}
							image={image}
							className={"relative rounded-full"}
						/>
					</div>
					<div className={"ml-12 mr-6 flex flex-col"}>
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
