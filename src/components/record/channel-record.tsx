import Image from "@/components/image.tsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card.tsx";
import type { MessageVM, RecordType } from "@/lib/schema.ts";
import type { RecordVM } from "./record";

interface ChannelRecordProps extends React.HTMLAttributes<HTMLDivElement> {
  message: MessageVM;
  record: ChannelRecordEntity;
  variant: "default" | string;
}

export interface ChannelRecordEntity extends RecordVM {
  "@_datatype": RecordType.CHANNEL;
  datatitle: string;
  datadesc: string;
  finderShareNameCard: {
    username: string;
    nickname: string;
    avatar: string;
  };
}

export default function ChannelRecord({
  message,
  record,
  variant = "default",
  ...props
}: ChannelRecordProps) {
  if (variant === "default")
    return (
      <Card className="max-w-[20em] w-fit" {...props}>
        <CardContent className={"flex items-center p-2.5 pr-4"}>
          <Image
            src={record.finderShareNameCard.avatar}
            alt={record.datatitle}
            className={"shrink-0 size-12 rounded-full"}
          />
          <CardTitle className="font-medium">{record.datatitle}</CardTitle>
        </CardContent>
        <CardFooter>视频号名片</CardFooter>
      </Card>
    );

  return <p>[视频号名片] {record.datatitle}</p>;
}
