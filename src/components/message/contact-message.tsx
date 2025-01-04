import Image from "@/components/image.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import type { ContactMessage as ContactMessageVM } from "@/lib/schema.ts";
import type * as React from "react";
import MessageInlineWrapper from "./message-inline";

type ContactMessageProps = MessageProp<ContactMessageVM>;

export interface ContactMessageEntity {
  msg: {
    "@_certflag": string; // 个人名片应该是 "0"
    "@_certinfo": string; // 企业认证信息

    "@_brandIconUrl": string;
    "@_brandHomeUrl": string; // JSON 公众号相关配置
    "@_brandSubscriptConfigUrl": string; // JSON 公众号相关配置
    "@_brandFlags": "0" | "1";

    "@_regionCode": string;

    "@_biznamecardinfo": string; // unknown

    "@_bigheadimgurl": string;
    "@_smallheadimgurl": string;
    "@_username": string;
    "@_nickname": string;
    "@_fullpy": string;
    "@_shortpy": string;
    "@_alias": string;
    "@_imagestatus": string; // unknown
    "@_scene": string;
    "@_province": string;
    "@_city": string;
    "@_sign": string; // 个性签名
    "@_sex": "0" | "1"; // TODO
  };
}

export default function ContactMessage({
  message,
  variant = "default",
  ...props
}: ContactMessageProps) {
  if (message.message_entity.msg["@_certflag"] === "0") {
    // 个人名片
    if (variant === "default")
      return (
        <div
          className="w-48 flex flex-col bg-white rounded-xl overflow-hidden"
          {...props}
        >
          {message.message_entity.msg["@_bigheadimgurl"] ? (
            <Image
              src={message.message_entity.msg["@_bigheadimgurl"]}
              alt=""
              className={"shrink-0 w-full rounded-lg"}
            />
          ) : (
            <div
              className={"shrink-0 w-full pb-[100%] rounded-lg bg-neutral-300"}
            />
          )}

          <h4 className="py-2.5 px-3 font-medium">
            {message.message_entity.msg["@_nickname"]}
          </h4>
        </div>
      );

    return (
      <MessageInlineWrapper message={message} {...props}>
        <span>[名片] {message.message_entity.msg["@_nickname"]}</span>
      </MessageInlineWrapper>
    );
  }

  if (variant === "default")
    return (
      <div className="max-w-80 w-fit  rounded-lg bg-white" {...props}>
        <div className={"flex items-center p-2.5 pr-4"}>
          <Image
            src={
              message.message_entity.msg["@_bigheadimgurl"] ??
              message.message_entity.msg["@_brandIconUrl"]
            }
            alt=""
            className={"shrink-0 size-12 rounded-full"}
          />
          <div className="ml-4 flex flex-col space-y-0.5">
            <h4 className="font-medium">
              {message.message_entity.msg["@_nickname"]}
            </h4>
            <p className={"text-sm line-clamp-1"}>
              {message.message_entity.msg["@_certinfo"]}
            </p>
          </div>
        </div>

        <div
          className={
            "px-3 py-1.5 text-sm leading-normal text-neutral-500 border-t border-neutral-200"
          }
        >
          公众号名片
        </div>
      </div>
    );

  return (
    <MessageInlineWrapper message={message} {...props}>
      <span>[公众号名片] {message.message_entity.msg["@_nickname"]}</span>
    </MessageInlineWrapper>
  );
}
