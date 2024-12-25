import LocalVoice from "@/components/local-voice.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { VoiceMessage as VoiceMessageVM } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";

type VoiceMessageProps = MessageProp<VoiceMessageVM>;

export interface VoiceMessageEntity {
  msg: {
    voicemsg: {
      "@_endflag": "0" | "1";
      "@_cancelflag": "0" | "1";
      "@_forwardflag": "0" | "1";
      "@_voiceformat": string;
      "@_voicelength": string;
      "@_length": string;
      "@_bufid": string;
      "@_aeskey": string;
      "@_voiceurl": string;
      "@_voicemd5": string;
      "@_clientmsgid": string;
      "@_fromusername": string;
    };
  };
}

export default function VoiceMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: VoiceMessageProps) {
  const { chat } = useApp();

  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div className={cn("max-w-[20em]")} {...props}>
          <LocalVoice chat={chat!} message={message} className={""} />
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [语音]{" "}
      {Math.floor(
        Number.parseInt(message.message_entity.msg.voicemsg["@_voicelength"]) /
          1000,
      )}
      ″
    </p>
  );
}
