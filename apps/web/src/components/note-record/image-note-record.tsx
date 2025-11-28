import { NoteMessageImageQueryOptions } from "@/lib/fetchers/note-message.ts";
import { AppMessageType, ImageNoteRecordType } from "@/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "../image.tsx";
import { NoteMessageEntity } from "../message/app-message/note-message.tsx";

interface ImageNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: AppMessageType<NoteMessageEntity>;
	recordEntity: ImageNoteRecordType;
}

export default function ImageNoteRecord({
	message,
	recordEntity,
	className,
	...props
}: ImageNoteRecordProps) {
	const { data: image } = useSuspenseQuery(
		NoteMessageImageQueryOptions({
			accountId: "",
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
