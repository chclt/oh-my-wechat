import {
	AudioNoteRecordType,
	NoteOpenMessageEntity,
	OpenMessageType,
} from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
import { RecordAudioQueryOptions } from "@/lib/fetchers/record.ts";
import { cn } from "@/lib/utils.ts";

interface AudioNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<NoteOpenMessageEntity>;
	recordEntity: AudioNoteRecordType;
}

export default function AudioNoteRecord({
	message,
	recordEntity,
	className,
	...props
}: AudioNoteRecordProps) {
	const { accountId } = useAccount();

	const audio = useQuery(
		RecordAudioQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
			record: recordEntity,
		}),
	);

	const audioFile = useResolveMessageFile(audio.data?.uri);

	return (
		<div className={cn("p-2.5 bg-muted rounded-xs", className)} {...props}>
			{(audio.isPending || audioFile.isPending) && (
				<p className="text-muted-foreground">音频加载中…</p>
			)}
			{(audio.isError || audioFile.error) && (
				<p className="text-muted-foreground">音频无法播放</p>
			)}
			{audio.isSuccess && !audio.data && (
				<p className="text-muted-foreground">备份中未找到对应音频</p>
			)}
			{audioFile.src && <audio src={audioFile.src} controls />}
		</div>
	);
}
