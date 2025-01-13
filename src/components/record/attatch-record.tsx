import type { MessageVM, RecordType } from "@/lib/schema.ts";
import type { RecordVM } from "./record";

interface AttatchRecordProps extends React.HTMLAttributes<HTMLDivElement> {
  message: MessageVM;
  record: AttatchRecordEntity;
  variant: "default" | string;
}

export interface AttatchRecordEntity extends RecordVM {
  "@_datatype": RecordType.ATTACH;
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
