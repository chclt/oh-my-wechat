import { RecordImageQueryOptions } from "@/lib/fetchers/record.ts";
import { ImageNoteRecordType, OpenMessageType } from "@/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "../image.tsx";

import { NoteOpenMessageEntity } from "@/schema/open-message.ts";

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
	const { data: image } = useSuspenseQuery(
		RecordImageQueryOptions({
			accountId: "",
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
