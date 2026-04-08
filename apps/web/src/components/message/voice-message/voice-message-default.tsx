import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import { MessageVoiceQueryOptions } from "@/lib/fetchers";
import { cn } from "@/lib/utils.ts";
import type { VoiceMessageProps } from "./types.ts";

export function VoiceMessageDefault({ message, ...props }: VoiceMessageProps) {
	const { accountId } = useAccount();

	const { ref: voiceRef, inViewport } = useInViewport();

	const { data: voice } = useQuery({
		...MessageVoiceQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
		}),
		enabled: inViewport,
	});

	return (
		<div className={cn("max-w-[20em]")} {...props}>
			<audio ref={voiceRef} src={voice?.src} controls />
		</div>
	);
}
