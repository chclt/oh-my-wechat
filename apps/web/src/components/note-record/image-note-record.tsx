import { RecordImageQueryOptions } from "@/lib/fetchers/record.ts";
import { Route } from "@/routes/$accountId/route.tsx";
import { ImageNoteRecordType, OpenMessageType } from "@/schema";
import { NoteOpenMessageEntity } from "@/schema/open-message.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
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

	return (
		<>
			{Object.keys(image).length ? (
				<Image
					src={image.regular?.src ?? image.thumbnail?.src}
					alt="image"
					className={className}
					{...props}
				/>
			) : (
				"图片"
			)}
		</>
	);
}
