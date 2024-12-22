import type { AppMessageProps } from "@/components/message/app-message.tsx";
import UrlMessage, {
  type UrlMessageEntity,
} from "@/components/message/app-message/url-message.tsx";
import User from "@/components/user.tsx";
import type {
  AppMessageType,
  AppMessage as AppMessageVM,
} from "@/lib/schema.ts";
import { decodeUnicodeReferences } from "@/lib/utils.ts";

export interface VoiceMessageEntity {
  type: AppMessageType.VOICE;
  title: string;
  des: string;
  username: string;
  action: string;
  url: string;
  lowurl: string;
  dataurl: string;
  lowdataurl: string;
  statextstr: string;
  songalbumurl: string;
  songlyric: string;
  musicShareItem: {
    mvCoverUrl: string;
    musicDuration: number;
    mid: string;
  };
}

type VoiceMessageProps = AppMessageProps<VoiceMessageEntity>;

export default function VoiceMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: VoiceMessageProps) {
  if (variant === "default") {
    return (
      <UrlMessage
        message={message as unknown as AppMessageVM<UrlMessageEntity>}
        direction={direction}
        variant={variant}
        showPhoto={showPhoto}
        showUsername={showUsername}
        {...props}
      />
    );
  }
  return (
    <p {...props}>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [音频] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
    </p>
  );
}
