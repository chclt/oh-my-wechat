import AnnouncementMessage, {
  type AnnouncementMessageEntity,
} from "@/components/message/app-message/announcement-message.tsx";
import Attach2Message, {
  type AttachMessage2Entity,
} from "@/components/message/app-message/attach-2-message.tsx";
import AttachMessage, {
  type AttachMessageEntity,
} from "@/components/message/app-message/attach-message.tsx";
import ChannelMessage, {
  type ChannelMessageEntity,
} from "@/components/message/app-message/channel-message.tsx";
import ChannelVideoMessage, {
  type ChannelVideoMessageEntity,
} from "@/components/message/app-message/channel-video-message.tsx";
import ForwardMessage2, {
  type ForwardMessage2Entity,
} from "@/components/message/app-message/forward-message-2.tsx";
import ForwardMessage, {
  type ForwardMessageEntity,
} from "@/components/message/app-message/forward-message.tsx";
import GameMessage, {
  type GameMessageEntity,
} from "@/components/message/app-message/game-message.tsx";
import LinkMessage2, {
  type LinkMessage2Entity,
} from "@/components/message/app-message/link-message-2.tsx";
import LiveMessage, {
  type LiveMessageEntity,
} from "@/components/message/app-message/live-message.tsx";
import MiniappMessage2, {
  type MiniappMessage2Entity,
} from "@/components/message/app-message/miniapp-message-2.tsx";
import MiniappMessage, {
  type MiniappMessageEntity,
} from "@/components/message/app-message/miniapp-message.tsx";
import MusicMessage, {
  type MusicMessageEntity,
} from "@/components/message/app-message/music-message.tsx";
import NoteMessage, {
  type NoteMessageEntity,
} from "@/components/message/app-message/note-message.tsx";
import PatMessage, {
  type PatMessageEntity,
} from "@/components/message/app-message/pat-message.tsx";
import RealtimeLocationMessage, {
  type RealtimeLocationMessageEntity,
} from "@/components/message/app-message/realtime-location-message.tsx";
import RedEnvelopeMessage, {
  type RedEnvelopeMessageEntity,
} from "@/components/message/app-message/red-envelope-message.tsx";
import ReferMessage, {
  type ReferMessageEntity,
} from "@/components/message/app-message/refer-message.tsx";
import RingtoneMessage, {
  type RingtoneMessageEntity,
} from "@/components/message/app-message/ringtone-message.tsx";
import ScanResultMessage, {
  type ScanResultMessageEntity,
} from "@/components/message/app-message/scan-result-message.tsx";
import SolitaireMessage, {
  type SolitaireMessageEntity,
} from "@/components/message/app-message/solitaire-message.tsx";
import StickerMessage, {
  type StickerMessageEntity,
} from "@/components/message/app-message/sticker-message.tsx";
import StickerSetMessage, {
  type StickerSetMessageEntity,
} from "@/components/message/app-message/sticker-set-message.tsx";
import StoreMessage, {
  type StoreMessageEntity,
} from "@/components/message/app-message/store-message.tsx";
import StoreProductMessage, {
  type StoreProductMessageEntity,
} from "@/components/message/app-message/store-product-message.tsx";
import TextMessage, {
  type AppTextMessageEntity,
} from "@/components/message/app-message/text-message.tsx";
import TingMessage, {
  type TingMessageEntity,
} from "@/components/message/app-message/ting-message.tsx";
import TransferMessage, {
  type TransferMessageEntity,
} from "@/components/message/app-message/transfer-message.tsx";
import UrlMessage, {
  type UrlMessageEntity,
} from "@/components/message/app-message/url-message.tsx";
import VideoMessage, {
  type VideoMessageEntity,
} from "@/components/message/app-message/video-message.tsx";
import VoiceMessage, {
  type VoiceMessageEntity,
} from "@/components/message/app-message/voice-message.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import {
  AppMessageType,
  type AppMessage as AppMessageVM,
} from "@/lib/schema.ts";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { LinkCard } from "../link-card";
import { CircleQuestionmarkSolid } from "../icon";

export type AppMessageProps<
  T = {
    type: 0;
  },
> = MessageProp<AppMessageVM<T>>;

export interface AppMessageEntity<
  T = {
    type: 0;
  },
> {
  msg: {
    appmsg: T;
    appinfo?: {
      appname: string;
    };
  };
}

export default function AppMessage({
  message,
  ...props
}: AppMessageProps<{
  type: unknown;
  [key: string]: unknown;
}>) {
  if (!message.message_entity.msg?.appmsg) {
    // throw new Error("Invalid app message");
    console.error(message);
    return (
      <div className="" {...props}>
        无法解析失败：49
      </div>
    );
  }

  switch (message.message_entity.msg.appmsg.type) {
    case AppMessageType.TEXT:
      return (
        <TextMessage
          message={message as unknown as AppMessageVM<AppTextMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.VOICE:
      return (
        <VoiceMessage
          message={message as unknown as AppMessageVM<VoiceMessageEntity>}
          {...props}
        />
      );
    case AppMessageType.VIDEO:
      return (
        <VideoMessage
          message={message as unknown as AppMessageVM<VideoMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.ATTACH:
      return (
        <AttachMessage
          message={message as unknown as AppMessageVM<AttachMessageEntity>}
          {...props}
        />
      );
    case AppMessageType.STICKER:
      return (
        <StickerMessage
          message={message as unknown as AppMessageVM<StickerMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.STICKER_SET:
      return (
        <StickerSetMessage
          message={message as unknown as AppMessageVM<StickerSetMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.REALTIME_LOCATION:
      return (
        <RealtimeLocationMessage
          message={
            message as unknown as AppMessageVM<RealtimeLocationMessageEntity>
          }
          {...props}
        />
      );

    case AppMessageType.FORWARD_MESSAGE:
      return (
        <ForwardMessage
          message={message as unknown as AppMessageVM<ForwardMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.NOTE:
      return (
        <NoteMessage
          message={message as unknown as AppMessageVM<NoteMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.MINIAPP_2:
      return (
        <MiniappMessage2
          message={message as unknown as AppMessageVM<MiniappMessage2Entity>}
          {...props}
        />
      );

    case AppMessageType.MINIAPP:
      return (
        <MiniappMessage
          message={message as unknown as AppMessageVM<MiniappMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.FORWARD_MESSAGE_2:
      return (
        <ForwardMessage2
          message={message as unknown as AppMessageVM<ForwardMessage2Entity>}
          {...props}
        />
      );

    case AppMessageType.CHANNEL:
      return (
        <ChannelMessage
          message={message as unknown as AppMessageVM<ChannelMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.CHANNEL_VIDEO:
      return (
        <ChannelVideoMessage
          message={
            message as unknown as AppMessageVM<ChannelVideoMessageEntity>
          }
          {...props}
        />
      );

    case AppMessageType.SOLITAIRE:
      return (
        <SolitaireMessage
          message={message as unknown as AppMessageVM<SolitaireMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.REFER:
      return (
        <ReferMessage
          message={message as unknown as AppMessageVM<ReferMessageEntity>}
          {...props}
        />
      );
    case AppMessageType.PAT:
      return (
        <PatMessage
          message={message as unknown as AppMessageVM<PatMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.LIVE:
      return (
        <LiveMessage
          message={message as unknown as AppMessageVM<LiveMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.LINK_2:
      return (
        <LinkMessage2
          message={message as unknown as AppMessageVM<LinkMessage2Entity>}
          {...props}
        />
      );

    case AppMessageType.ATTACH_2:
      return (
        <Attach2Message
          message={message as unknown as AppMessageVM<AttachMessage2Entity>}
          {...props}
        />
      );

    case AppMessageType.MUSIC:
      return (
        <MusicMessage
          message={message as unknown as AppMessageVM<MusicMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.STORE_PRODUCT:
      return (
        <StoreProductMessage
          message={
            message as unknown as AppMessageVM<StoreProductMessageEntity>
          }
          {...props}
        />
      );

    case AppMessageType.ANNOUNCEMENT:
      return (
        <AnnouncementMessage
          message={
            message as unknown as AppMessageVM<AnnouncementMessageEntity>
          }
          {...props}
        />
      );

    case AppMessageType.TING:
      return (
        <TingMessage
          message={message as unknown as AppMessageVM<TingMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.GAME:
      return (
        <GameMessage
          message={message as unknown as AppMessageVM<GameMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.STORE:
      return (
        <StoreMessage
          message={message as unknown as AppMessageVM<StoreMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.TRANSFER:
      return (
        <TransferMessage
          message={message as unknown as AppMessageVM<TransferMessageEntity>}
          {...props}
        />
      );
    case AppMessageType.RED_ENVELOPE:
      return (
        <RedEnvelopeMessage
          message={message as unknown as AppMessageVM<RedEnvelopeMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.URL:
      return (
        <UrlMessage
          message={message as unknown as AppMessageVM<UrlMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.SCAN_RESULT:
      return (
        <ScanResultMessage
          message={message as unknown as AppMessageVM<ScanResultMessageEntity>}
          {...props}
        />
      );

    case AppMessageType.RINGTONE:
      return (
        <RingtoneMessage
          message={message as unknown as AppMessageVM<RingtoneMessageEntity>}
          {...props}
        />
      );

    default:
      return (
        <Dialog>
          <DialogTrigger className="text-start">
            <LinkCard
              abstract={`暂未支持的消息类型：${message.message_entity.msg.appmsg.type}`}
              from={`49:${message.message_entity.msg.appmsg.type}`}
              icon={<CircleQuestionmarkSolid className=" scale-[135%]" />}
            />
          </DialogTrigger>
          <DialogContent>
            <ScrollArea>
              <pre className="text-sm pb-4 text-wrap">
                {message.raw_message}
              </pre>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      );
  }
}
