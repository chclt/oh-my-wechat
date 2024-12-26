import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { AppMessageType } from "@/lib/schema.ts";

export interface TransferMessageEntity {
  type: AppMessageType.TRANSFER;
  title: string;
  des: string;

  wcpayinfo: {
    paysubtype: number; // 3: 发 8: 收
    feedesc: string; // eg. "¥23.00"
    transcationid: number;
    transferid: number;
    invalidtime: number;
    effectivedate: number;
    begintransfertime: number;
    templateid: number;
    url: string;
    nativeurl: string;
    iconurl: string;
    locallogoicon: string;
    localbubbleicon: string;
    receivertitle: string;
    sendertitle: string;
    hinttext: string;
    scenetext: string;
    sceneid: number;
    exclusive_recv_username: string;
    receiver_username: string;
    payer_username: string;
    bubble_click_flag: number;
    redenvelopetype: number;
    redenvelopereceiveamount: number;
    detailshowsourcemd5: string;
    recshowsourcemd5: string;
    receiverc2cshowsourcemd5: string;
    senderc2cshowsourcemd5: string;
    senderc2cshowsourceurl: string;
    receiverc2cshowsourceurl: string;
    recshowsourceurl: string;
    detailshowsourceurl: string;
    subtype: number;
    corpname: string;
    expressionurl: string;
    expressiontype: number;
    senderdes: string;
    receiverdes: string;
    total_fee: string;
    fee_type: string;
    innertype: number;
    bubbletype: number;
    receivestatus: number;
    paymsgid: string;
    pay_memo: string;
    has_transfer_address: number;
    imageid: string;
    imageaeskey: string;
    imagelength: number;
    newaa: {
      billno: string;
      newaatype: number;
      launchertitle: string;
      receivertitle: string;
      receiverlist: string;
      payertitle: string;
      payerlist: string;
      notinertitle: string;
      launcherusername: string;
    };
  };
}

type TransferMessageProps = AppMessageProps<TransferMessageEntity>;

export default function TransferMessage({
  message,
  variant = "default",
  ...props
}: TransferMessageProps) {
  const { chat } = useApp();

  const payerId = message.message_entity.msg.appmsg.wcpayinfo.payer_username;
  const payer = chat?.members.find((member) => member.id === payerId);
  if (payer && message.from === undefined) message.from = payer;

  const receiverId =
    message.message_entity.msg.appmsg.wcpayinfo.receiver_username;
  const receiver = chat?.members.find((member) => member.id === receiverId);

  if (variant === "default")
    return (
      <div
        className="w-64 py-4 pl-4 pr-6 flex gap-4 items-center bg-white rounded-2xl border border-neutral-200"
        {...props}
      >
        <div className={"shrink-0 size-12 bg-neutral-400 rounded-full"} />
        <div>
          <h4 className={"font-medium"}>
            {message.message_entity.msg.appmsg.wcpayinfo.pay_memo.length > 0 ? (
              message.message_entity.msg.appmsg.wcpayinfo.pay_memo
            ) : (
              <>
                {message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 3 &&
                  "接收转账"}

                {message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 8 &&
                  "发起转账"}
              </>
            )}
          </h4>
          <p className={"text-sm text-neutral-600"}>
            {message.message_entity.msg.appmsg.wcpayinfo.feedesc}
            {/*{payer && (*/}
            {/*  <span>*/}
            {/*    FROM*/}
            {/*    {payer.remark ?? payer.username}*/}
            {/*  </span>*/}
            {/*)}*/}

            {/*{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 8 &&*/}
            {/*  "发起了一笔微信转账"}*/}
            {/*{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 3 &&*/}
            {/*  "接收了微信转账"}*/}
          </p>
        </div>
      </div>
    );
  return (
    <MessageInlineWrapper message={message} {...props}>
      [转账] {message.from.remark ?? message.from.username}
      {message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 8 &&
        "发起转账"}
      {message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 3 &&
        "接收转账"}
    </MessageInlineWrapper>
  );
}
