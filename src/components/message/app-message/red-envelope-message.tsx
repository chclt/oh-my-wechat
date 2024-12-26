import { RedEnvelopeIcon } from "@/components/icon.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
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
    scenetext: string; // 好像也有可能是数组
    senderdes: string; // eg. 查看红包
    receiverdes: string; // eg. 领取红包
    nativeurl: `wxpay://${string}`;
    sceneid: number;
    innertype: number;
    paymsgid: number;
    locallogoicon: string;
    invalidtime: number;
    broaden: "";

    exclusive_recv_username?: string; // 群里发红包指定接收人
    senderc2cshowsourceurl?: string; // 红包封面裁切
    receiverc2cshowsourceurl?: string; // 红包封面裁切
    recshowsourceurl?: string; // 红包封面全尺寸加上红包模板
    detailshowsourceurl?: string; // 红包封面全尺寸
    corpname?: string; // 红包封面的作者是哪个品牌
  };
}

type RedEnvelopeMessageProps = AppMessageProps<RedEnvelopeMessageEntity>;

export default function RedEnvelopeMessage({
  message,
  variant = "default",
  ...props
}: RedEnvelopeMessageProps) {
  if (variant === "default")
    return (
      <>
        {message.message_entity.msg.appmsg.wcpayinfo
          .receiverc2cshowsourceurl ? (
          <div
            className="w-64 bg-white overflow-hidden rounded-2xl border border-neutral-200"
            {...props}
          >
            <img
              src={
                message.message_entity.msg.appmsg.wcpayinfo
                  .receiverc2cshowsourceurl
              }
              alt={"红包封面"}
              className={"rounded-2xl"}
            />
            <div className={"py-2 pl-2 pr-3 flex gap-1"}>
              <div className={"size-6 [&_svg]:size-full"}>
                <RedEnvelopeIcon />
              </div>
              <div>
                <h4 className={"font-medium"}>
                  {message.message_entity.msg.appmsg.wcpayinfo.sendertitle}
                </h4>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="w-64 py-4 pl-2.5 pr-6 flex gap-2 items-center bg-white rounded-2xl border border-neutral-200"
            {...props}
          >
            <div className={"shrink-0 size-12  [&_svg]:size-full"}>
              <RedEnvelopeIcon />
            </div>
            <div>
              <h4 className={"font-medium"}>
                {message.message_entity.msg.appmsg.wcpayinfo.sendertitle}
              </h4>
            </div>
          </div>
        )}
      </>
    );

  return (
    <MessageInlineWrapper message={message} {...props}>
      [红包] {message.message_entity.msg.appmsg.wcpayinfo.sendertitle}
    </MessageInlineWrapper>
  );
}
