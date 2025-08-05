import Image from "@/components/image.tsx";
import Link from "@/components/link.tsx";
import type { MessageType, RecordTypeEnum } from "@/lib/schema.ts";
import { cn } from "@/lib/utils";
import type { RecordType } from "./record";
interface TingRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: TingRecordEntity;
	variant: "default" | string;
}

export interface TingRecordEntity extends RecordType {
	"@_datatype": RecordTypeEnum.TING;

	datatitle: string;
	datadesc: string;

	streamweburl: string; // 如果是音乐，这个链接一般是前往QQ音乐，如果是音频，这个链接前往公众号文章
	songalbumurl: string;
	weburlitem: {
		thumburl: string;
		title: string;
	};

	// 如果是音乐会有下面的数据
	streamdataurl?: string;
	streamlowbandurl?: string;
	musicShareItem?: {
		mvSingerName: string;
		mid: string;
	};
}

export default function TingRecord({
	message,
	record,
	variant = "default",
	className,
	...props
}: TingRecordProps) {
	if (variant === "default")
		return (
			<Link href={record.streamweburl}>
				<div
					className={cn(
						"relative max-w-[20em] h-24 rounded-2xl overflow-hidden bg-white",
						className,
					)}
					{...props}
				>
					{record.songalbumurl ? (
						<Image
							src={record.songalbumurl}
							className={"absolute inset-0 w-full h-full object-cover"}
						/>
					) : null}

					<div
						className={
							"h-full flex items-center gap-4 pe-6 bg-white/60 backdrop-blur-xl"
						}
					>
						{record.songalbumurl ? (
							<Image
								src={record.songalbumurl}
								className={"h-full w-auto rounded-lg"}
							/>
						) : null}

						<div className={"flex flex-col"}>
							<h4 className="break-words font-medium line-clamp-2">
								{record.datatitle}
							</h4>
							<p
								className={
									"mt-1 text-sm text-secondary-foreground line-clamp-1 break-all"
								}
							>
								{record.datadesc}
							</p>
						</div>
					</div>
				</div>
			</Link>
		);

	return (
		<p className={"inline"} {...props}>
			{record.musicShareItem ? "[音乐]" : "[音频]"} {record.datatitle}
		</p>
	);
}
