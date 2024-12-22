import Image from "@/components/image.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import User from "@/components/user.tsx";
import type { StickerMessage as StickerMessageVM } from "@/lib/schema.ts";

type StickerMessageProps = MessageProp<StickerMessageVM>;

export interface StickerMessageEntity {
  msg: {
    emoji: {
      "@_fromusername": string;
      "@_tousername": string;
      "@_type": string;
      "@_idbuffer": string;
      "@_md5": string;
      "@_len": string;
      "@_productid": string;
      "@_androidmd5": string;
      "@_androidlen": string;

      "@_s60v3md5": string;
      "@_s60v3len": string;
      "@_s60v5md5": string;
      "@_s60v5len": string;

      "@_cdnurl": string;
      "@_designerid": string;
      "@_thumburl": string;
      "@_encrypturl": string;
      "@_aeskey": string;

      "@_externurl": string;
      "@_externmd5": string;

      "@_width": string;
      "@_height": string;

      "@_tpurl": string;
      "@_tpauthkey": string;
      "@_attachedtext": string;
      "@_attachedtextcolor": string;
      "@_lensid": string;
      "@_emojiattr": string;
      "@_linkid": string;
      "@_desc": string;
    };

    gameext: {
      "@_type": string;
      "@_content": string;
    };
  };
}

export default function StickerMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: StickerMessageProps) {
  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div className="" {...props}>
          <Image
            {...(message.message_entity.msg.emoji["@_width"]
              ? {
                  width: message.message_entity.msg.emoji["@_width"],
                }
              : {})}
            {...(message.message_entity.msg.emoji["@_height"]
              ? {
                  height: message.message_entity.msg.emoji["@_height"],
                }
              : {})}
            src={message.message_entity.msg.emoji["@_cdnurl"]}
            alt={"表情"}
            className={"min-w-11 min-h-11 max-w-32 max-h-32"}
            style={
              {
                // width: message.message_entity.msg.emoji["@_width"],
                // height: message.message_entity.msg.emoji["@_height"],
              }
            }
          />
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [表情]
    </p>
  );
}
