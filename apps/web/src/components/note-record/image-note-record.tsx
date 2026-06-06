import {
	ImageNoteRecordType,
	NoteOpenMessageEntity,
	OpenMessageType,
} from "@repo/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
import { RecordImageQueryOptions } from "@/lib/fetchers/record.ts";
import { Route } from "@/routes/$accountId/route.tsx";
import Image from "../image.tsx";

interface ImageNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<NoteOpenMessageEntity>;
	recordEntity: ImageNoteRecordType;
}

export default function ImageNoteRecord({
	message,
	recordEntity,
	className,
	...props
}: ImageNoteRecordProps) {
	const { accountId } = Route.useParams();

	const { data: image } = useSuspenseQuery(
		RecordImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message: message,
			record: recordEntity,
		}),
	);

	const imageSrc = useResolveMessageFile(
		image.regular?.uri ?? image.thumbnail?.uri,
	);

	return (
		<>
			{Object.keys(image).length ? (
				<Image src={imageSrc} alt="image" className={className} {...props} />
			) : (
				"图片"
			)}
		</>
	);
}
