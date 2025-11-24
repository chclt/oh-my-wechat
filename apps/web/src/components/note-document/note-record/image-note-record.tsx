import { NoteMessageImageQueryOptions } from "@/lib/fetchers/note-message";
import { AppMessageType, RecordTypeEnum } from "@/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "../../image";
import { NoteMessageEntity } from "../../message/app-message/note-message";

export interface ImageNoteRecordEntity {
	"@_datatype": RecordTypeEnum.IMAGE;
	"@_dataid": string;
	"@_htmlid": string;

	thumbfullmd5: string;
	cdnthumbkey: string;
	cdnthumburl: string;
	thumbhead256md5: string;
	thumbsize: number;

	fullmd5: string;
	cdndatakey: string;
	cdndataurl: string;
	head256md5: string;
	datasize: number;
}

interface ImageNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: AppMessageType<NoteMessageEntity>;
	recordEntity: ImageNoteRecordEntity;
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
