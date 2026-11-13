import {
	NoteEntity,
	NoteOpenMessageEntity,
	NoteRecordType,
	OpenMessageType,
} from "@repo/types";
import parse, { DOMNode, domToReact, Element } from "html-react-parser";
import NoteRecord from "@/components/note-record/note-record";
import { cn } from "@/lib/utils";

interface NoteDocumentProps extends React.HTMLAttributes<HTMLElement> {
	docContent: string;
	noteEntity: NoteEntity;
	message: OpenMessageType<NoteOpenMessageEntity>;
}

export default function NoteDocument({
	docContent,
	noteEntity,
	message,
	className,
	...props
}: NoteDocumentProps) {
	const parsedDocContent = docContent
		? parse(cleanNoteDocumentHtml(docContent), {
				replace: (domNode) => {
					if (domNode instanceof Element && domNode.name === "wn-todo") {
						return (
							<span className="block ms-2">
								<input
									type="checkbox"
									checked={domNode.attribs.checked === "1"}
									className="me-3 relative bottom-[-0.12em]"
								/>
								<span>{domToReact(domNode.children as DOMNode[])}</span>
							</span>
						);
					} else if (domNode instanceof Element && domNode.name === "object") {
						// Object 上标记的 data-type 不是 Record 的类型， dataitem 里面的才是正确的，原因未知
						const recordEntity = noteEntity.recordinfo.datalist.dataitem.find(
							(item): item is NoteRecordType =>
								item["@_htmlid"] !== "WeNoteHtmlFile" &&
								item["@_htmlid"] === domNode.attribs["id"],
						);

						if (!recordEntity) {
							return <>加载失败</>;
						}

						return (
							<NoteRecord
								message={message}
								recordEntity={recordEntity}
								className="not-prose my-4"
							/>
						);
					}
				},
			})
		: null;

	if (!docContent) return null;

	return (
		<section
			className={cn(
				"p-4 overflow-hidden",
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
