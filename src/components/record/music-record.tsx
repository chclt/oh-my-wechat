import Link from "@/components/link.tsx";
import type { MessageVM, RecordType } from "@/lib/schema.ts";
import type { RecordVM } from "./record";

interface MusicRecordProps extends React.HTMLAttributes<HTMLDivElement> {
  message: MessageVM;
  record: MusicRecordEntity;
  variant: "default" | string;
}

export interface MusicRecordEntity extends RecordVM {
  "@_datatype": RecordType.MUSIC;
  datatitle: string;
  streamweburl: string;
  streamdataurl: string;
}

export default function MusicRecord({
  message,
  record,

  ...props
}: MusicRecordProps) {
  return (
    <div {...props}>
      <Link href={record.streamweburl}>[音乐] {record.datatitle}</Link>
    </div>
  );
}
