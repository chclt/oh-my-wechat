import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import type { AppMessageType } from "@/lib/schema.ts";

export interface RedEnvelopeMessageEntity {
  type: AppMessageType.RED_ENVELOPE;
  title: string;
  des: string;
  url: string;
  thumburl: string;
  wcpayinfo: {
    templateid: string;
    url: string;
    iconurl: string;
    receivertitle: string;
    sendertitle: string;
    scenetext: [string, string];
    senderdes: string;
    receiverdes: string;
    nativeurl: `wxpay://${string}`;
    sceneid: number;
    innertype: number;
    paymsgid: number;
    locallogoicon: "c2c_hongbao_icon_cn" | string;
    invalidtime: number;
    broaden: "";
  };
}

type RedEnvelopeProps = AppMessageProps<RedEnvelopeMessageEntity>;

export default function RedEnvelope({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  className,
  ...props
}: RedEnvelopeProps) {
  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className="w-64 py-4 pl-4 pr-6 flex gap-4 items-center bg-white rounded-2xl border border-neutral-200"
          {...props}
        >
          <div className={"shrink-0 size-12 bg-neutral-400 rounded-full"} />
          <div>
            <h4 className={"font-medium"}>
              {message.message_entity.msg.appmsg.wcpayinfo.sendertitle}
            </h4>
          </div>
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [红包] {message.message_entity.msg.appmsg.wcpayinfo.sendertitle}
    </p>
  );
}
