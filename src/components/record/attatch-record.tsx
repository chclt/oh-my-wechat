import type { MessageType, RecordTypeEnum } from "@/schema";
import type { RecordType } from "./record";

interface AttatchRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: AttatchRecordEntity;
	variant: "default" | string;
}

export interface AttatchRecordEntity extends RecordType {
	"@_datatype": RecordTypeEnum.ATTACH;
	datatitle: string;
	datasize: number;
}

export default function AttatchRecord({
	message,
	record,
	variant = "default",
	className,
	...props
}: AttatchRecordProps) {
	if (variant === "default")
		return (
			<div className={className} {...props}>
				{record.datatitle}
			</div>
		);

	return <p className="inline">{record.datatitle}</p>;
}
