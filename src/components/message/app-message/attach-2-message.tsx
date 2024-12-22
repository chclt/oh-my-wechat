import type { AppMessageProps } from "@/components/message/app-message.tsx";
import AttachMessage, {
  type AttachMessageEntity,
} from "@/components/message/app-message/attach-message.tsx";
import type {
  AppMessageType,
  AppMessage as AppMessageVM,
} from "@/lib/schema.ts";

export interface AttachMessage2Entity {
  type: AppMessageType.ATTACH_2;
  title: string;
  des: string;
  md5: string;
  laninfo: string;
  appattach: {
    totallen: number;
    fileext: string;
    fileuploadtoken: string;
    status: number;
  };
}

type AttachMessage2Props = AppMessageProps<AttachMessage2Entity>;

export default function Attach2Message({
  message,
  ...props
}: AttachMessage2Props) {
  return (
    <AttachMessage
      message={message as unknown as AppMessageVM<AttachMessageEntity>}
      {...props}
    />
  );
}
