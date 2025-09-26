import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import type { RecordType } from "@/components/record/record.tsx";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import type { AppMessageTypeEnum } from "@/schema";

export interface NoteMessageEntity {
	type: AppMessageTypeEnum.NOTE;
	title: string;

	des: string;

	appattach: {
		totallen: number;
		attachid: string;
		emoticonmd5: string;
		fileext: string;
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbwidth: number;
		cdnthumbheight: number;
		cdnthumbaeskey: string;
		aeskey: string;
	};
	recorditem: string; // xml
}

/**
 * 一个笔记是一个 htm 文件，文件内除了文本，还包括 <object> 标签，
 * 标签内是图片、视频、音频等富媒体内容，
 */
interface NoteRecordEntity extends RecordType {
	"@_htmlid": "WeNoteHtmlFile" | string;
}

type NoteMessageProps = AppMessageProps<NoteMessageEntity>;

export default function NoteMessage({
	message,
	variant = "default",
	...props
}: NoteMessageProps) {
	if (variant === "default") {
		return <NoteMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <NoteMessageAbstract message={message} {...props} />;
	}
}

function NoteMessageDefault({
	message,
	...props
}: Omit<NoteMessageProps, "variant">) {
	// const xmlParser = new XMLParser({
	//   parseAttributeValue: true,
	//   ignoreAttributes: false,
	//   tagValueProcessor: (_, tagValue, jPath) => {
	//     if (
	//       jPath === "recordinfo.datalist.dataitem.datatitle" ||
	//       jPath === "recordinfo.datalist.dataitem.datadesc"
	//     ) {
	//       return undefined; // 不解析
	//     }
	//     return tagValue; // 走默认的解析
	//   },
	// });

	// const noteContent: {
	//   recordinfo: {
	//     desc: string;
	//     editTime: number;
	//     editusr: string;
	//     noteinfo: {
	//       noteauthor: string;
	//       noteeditor: string;
	//     };
	//     datalist: {
	//       "@_count": number;
	//       dataitem: NoteRecordEntity[];
	//     };
	//   };
	// } = xmlParser.parse(
	//   decodeUnicodeReferences(
	//     message.message_entity.msg.appmsg.recorditem.replace(/&#x20;/g, " "), // 有些时候标签和属性之间的空格编码过
	//   ),
	// );

	// const htmlFile = noteContent.recordinfo.datalist.dataitem.find(
	//   (item) => item["@_htmlid"] === "WeNoteHtmlFile",
	// );

	// const [query, isQuerying, result, error] = useQuery<FileInfo[] | undefined>(
	//   undefined,
	// );

	// useEffect(() => {
	//   query("/attaches", { chat, message, record: htmlFile, type: "text/html" });
	// }, []);

	return (
		<div
			className={cn("relative max-w-[20em] flex flex-col rounded-lg bg-white")}
			{...props}
		>
			<div className="p-3">
				{decodeUnicodeReferences(message.message_entity.msg.appmsg.des)
					.split("\n")
					.map((segment, index) => (
						<p key={index}>{segment}</p>
					))}
			</div>

			<div
				className={
					"px-3 py-1.5 text-sm leading-normal text-neutral-500 border-t border-neutral-200"
				}
			>
				笔记
			</div>
		</div>
	);
}

function NoteMessageAbstract({
	message,
	...props
}: Omit<NoteMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[笔记] {message.message_entity.msg.appmsg.des}
		</MessageInlineWrapper>
	);
}
