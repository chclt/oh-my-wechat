import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { cn } from "@/lib/utils.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type { GameMessageProps } from "./types";
import { useAccount } from "@/components/account-provider.tsx";

export function GameMessageDefault({ message, ...props }: GameMessageProps) {
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
		<div
			className={cn("relative max-w-[20em] flex flex-col rounded-lg bg-white")}
			{...props}
		>
			<div className="p-3">
				<h4 className="font-medium text-pretty line-clamp-3">
					{message.message_entity.msg.appmsg.title}
				</h4>
				<div className={"mt-1 text-pretty line-clamp-5 text-neutral-500"}>
					{message.message_entity.msg.appmsg.appattach.cdnthumbmd5 && (
						<AutoResolutionFallbackImage
							ref={imageRef}
							image={image}
							className={"float-end ms-2 h-12 w-auto rounded"}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
