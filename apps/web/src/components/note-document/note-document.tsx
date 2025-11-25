import { cn } from "@/lib/utils";
import {
	AppMessageType,
	NoteAttachRecordEntity,
	NoteAudioRecordEntity,
	NoteEntity,
	NoteImageRecordEntity,
	NoteLocationRecordEntity,
	NoteVideoRecordEntity,
	RecordTypeEnum,
} from "@/schema";
import { useQuery } from "@tanstack/react-query";
import parse, { DOMNode, domToReact, Element } from "html-react-parser";
import { NoteMessageEntity } from "../message/app-message/note-message";
import AttatchNoteRecord from "./note-record/attatch-note-record";
import AudioNoteRecord from "./note-record/audio-note-record";
import ImageNoteRecord from "./note-record/image-note-record";
import LocationNoteRecord from "./note-record/location-note-record";
import VideoNoteRecord from "./note-record/video-note-record";

interface NoteDocumentProps extends React.HTMLAttributes<HTMLElement> {
	docUrl: string;
	noteEntity: NoteEntity;
	message: AppMessageType<NoteMessageEntity>;
}

export default function NoteDocument({
	docUrl,
	noteEntity,
	message,
	className,
	...props
}: NoteDocumentProps) {
	const { data: docContent } = useQuery({
		queryKey: ["note-message-html", docUrl],
		queryFn: () => {
			return fetch(docUrl).then((res) => res.text());
		},
	});

	const parsedDocContent = docContent
		? parse(cleanNoteDocumentHtml(docContent), {
				replace: (domNode) => {
					if (domNode instanceof Element && domNode.name === "wn-todo") {
						return (
							<div className="ms-2">
								<input
									type="checkbox"
									checked={domNode.attribs.checked === "1"}
									className="me-3 relative bottom-[-0.12em]"
								/>
								<span>{domToReact(domNode.children as DOMNode[])}</span>
							</div>
						);
					} else if (domNode instanceof Element && domNode.name === "object") {
						// Object 上标记的 data-type 不是 Record 的类型， dataitem 里面的才是正确的，原因未知
						const recordInfo = noteEntity.recordinfo.datalist.dataitem.find(
							(item) => item["@_htmlid"] === domNode.attribs["id"],
						);

						if (!recordInfo) {
							return <>加载失败</>;
						}

						const recordEntity = noteEntity.recordinfo.datalist.dataitem.find(
							(item) => item["@_htmlid"] === domNode.attribs["id"],
						);

						if (!recordEntity) {
							return <>加载失败</>;
						}

						if (recordInfo["@_datatype"] === RecordTypeEnum.IMAGE) {
							return (
								<ImageNoteRecord
									message={message}
									recordEntity={recordEntity as NoteImageRecordEntity}
									className="not-prose my-4"
								/>
							);
						} else if (recordInfo["@_datatype"] === RecordTypeEnum.AUDIO) {
							return (
								<AudioNoteRecord
									message={message}
									recordEntity={recordEntity as NoteAudioRecordEntity}
									className="not-prose my-4"
								/>
							);
						} else if (recordInfo["@_datatype"] === RecordTypeEnum.ATTACH) {
							return (
								<AttatchNoteRecord
									message={message}
									recordEntity={recordEntity as NoteAttachRecordEntity}
									className="not-prose my-4"
								/>
							);
						} else if (recordInfo["@_datatype"] === RecordTypeEnum.VIDEO) {
							return (
								<VideoNoteRecord
									message={message}
									recordEntity={recordEntity as NoteVideoRecordEntity}
									className="not-prose my-4"
								/>
							);
						} else if (recordInfo["@_datatype"] === RecordTypeEnum.LOCATION) {
							return (
								<LocationNoteRecord
									recordEntity={recordEntity as NoteLocationRecordEntity}
									className="not-prose my-4"
								/>
							);
						}
						return (
							<pre>未知元素： {JSON.stringify(domNode.attribs, null, 2)}</pre>
						);
					}
				},
			})
		: null;

	if (!docContent) return null;

	return (
		<section
			className={cn(
				"p-4",
				"prose prose-neutral max-w-none leading-[inherit]",
				"prose-p:my-0",
				"prose-ul:my-0",
				"prose-ol:my-0",
				"prose-li:my-0",
				"prose-li:[&::marker]:text-foreground",
				"prose-img:my-4",
				"prose-video:my-4",
				"prose-hr:my-4",
				"[&_mark]:bg-yellow-300",
				className,
			)}
			{...props}
		>
			{parsedDocContent}
		</section>
	);
}

/**
 * 笔记可能的内容是<head>...</head><p>...</p>...
 * 直接给 html-react-parser 解析会只解析到 head
 * 这里只保留合法的 body 内标签
 */
function cleanNoteDocumentHtml(html: string) {
	const document = new DOMParser().parseFromString(html, "text/html");
	const body = document.body;
	return body.innerHTML;
}
