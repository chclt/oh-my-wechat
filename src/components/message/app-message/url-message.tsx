import Image from "@/components/image.tsx";
import { LinkCard } from "@/components/link-card";
import LocalImage from "@/components/local-image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { AppMessageType } from "@/lib/schema.ts";
import { decodeUnicodeReferences } from "@/lib/utils.ts";

export interface UrlMessageEntity {
  type: AppMessageType.URL;
  title: string;
  des?: string;
  username: string;
  action: string;
  content: string;
  url: string;
  lowurl: string;
  forwardflag: number;
  dataurl: string;
  lowdataurl: string;
  contentattr: number;
  streamvideo: {
    appattach: {
      attachid: string;
      cdnthumburl: string;
      cdnthumbmd5: string;
      cdnthumblength: number;
      cdnthumbheight: number;
      cdnthumbwidth: number;
      cdnthumbaeskey: string;
      aeskey: string;
      encryver: number;
      fileext: string;
      islargefilemsg: number;
    };
    extinfo: string;
    androidsource: number;
    md5: string;
  };
  appattach: {
    attachid: string;
    cdnthumburl: string;
    cdnthumbmd5: string;
    cdnthumblength: number;
    cdnthumbheight: number;
    cdnthumbwidth: number;
    cdnthumbaeskey: string;
    aeskey: string;
    encryver: number;
    fileext: string;
    islargefilemsg: number;
  };
  extinfo: string;
  androidsource: number;
  sourceusername: string;
  sourcedisplayname?: string;
  commenturl: string;
  thumburl?: string;
  mediatagname: string;
  messageaction: string;
  messageext: string;
  emotionpageshared: {
    webviewshared: {
      shareUrlOriginal: string;
      shareUrlOpen: string;
      jsAppId: string;
      publisherId: string;
    };
    template_id: string;
    md5: string;
    weappinfo: {
      username: string;
      appid: string;
      appservicetype: number;
      secflagforsinglepagemode: number;
      videopageinfo: {
        thumbwidth: number;
        thumbheight: number;
        fromopensdk: number;
      };
    };
  };
}

type UrlMessageProps = AppMessageProps<UrlMessageEntity>;

export default function UrlMessage({
  message,
  variant = "default",
  ...props
}: UrlMessageProps) {
  const { chat } = useApp();

  const heading = decodeUnicodeReferences(
    message.message_entity.msg.appmsg.title,
  );

  const preview =
    (message.message_entity.msg.appmsg.thumburl ? (
      <Image src={message.message_entity.msg.appmsg.thumburl} alt={heading} />
    ) : undefined) ??
    (message.message_entity.msg.appmsg.appattach.cdnthumbmd5 ? (
      <LocalImage
        chat={chat!}
        message={message}
        domain="opendata"
        alt={heading}
      />
    ) : undefined);

  if (variant === "default")
    return (
      <LinkCard
        href={message.message_entity.msg.appmsg.url}
        heading={heading}
        abstract={message.message_entity.msg.appmsg.des}
        preview={preview}
        from={message.message_entity.msg.appmsg.sourcedisplayname}
        {...props}
      />
    );

  return (
    <MessageInlineWrapper message={message} {...props}>
      [链接] {heading}
    </MessageInlineWrapper>
  );
}
