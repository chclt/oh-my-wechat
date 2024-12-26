import type { MessageProp } from "@/components/message/message.tsx";
import type { VoipMessage as VoipMessageVM } from "@/lib/schema.ts";

type VoipMessageProps = MessageProp<VoipMessageVM>;
export interface VoipMessageEntity {
  voipmsg?: {
    "@_type": "VoIPBubbleMsg" | string; // eg. VoIPBubbleMsg
    VoIPBubbleMsg: {
      msg: string; // eg. 通话时长 00:31
      room_type: string; // unknown eg. 1
      red_dot: "true" | "false";
      roomid: string;
      roomkey: string;
      inviteid: string;
      msg_type: string; // eg. 0
      timestamp: string;
      identity: string;
      duration: string;
      inviteid64: string;
      business: string;
    };
  };
  voipinvitemsg?: {
    roomid: 88320233;
    key: "7240177537323914205";
    status: 2;
    invitetype: 1;
  };
  voipextinfo?: {
    recvtime: 1685271014;
  };
}

export default function VoipMessage({
  message,
  variant = "default",
  ...props
}: VoipMessageProps) {
  if (variant === "default")
    return (
      <>
        {message.message_entity.voipmsg && (
          <div
            className="max-w-[20em] py-4 pl-4 pr-6 flex gap-4 items-center bg-white rounded-2xl border border-neutral-200"
            {...props}
          >
            <div className={"shrink-0 size-12 bg-neutral-400 rounded-full"} />
            <div>
              <h4 className={"font-medium"}>
                {message.from.remark ?? message.from.username}发起了语音通话
              </h4>
              <p className={"text-sm text-neutral-600"}>
                {message.message_entity.voipmsg["@_type"] === "VoIPBubbleMsg" &&
                  message.message_entity.voipmsg[
                    message.message_entity.voipmsg["@_type"]
                  ].msg}
              </p>
            </div>
          </div>
        )}

        {message.message_entity.voipinvitemsg && (
          <div className="" {...props}>
            <p>通话邀请</p>
          </div>
        )}
      </>
    );

  return (
    <p>
      {message.message_entity.voipmsg && (
        <span>
          [语音通话]{" "}
          {message.message_entity.voipmsg["@_type"] === "VoIPBubbleMsg" &&
            message.message_entity.voipmsg[
              message.message_entity.voipmsg["@_type"]
            ].msg}
        </span>
      )}

      {message.message_entity.voipinvitemsg && <span>通话邀请</span>}
    </p>
  );
}
