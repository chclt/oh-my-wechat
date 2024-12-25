import AppMessage from "@/components/message/app-message.tsx";
import ChatroomVoipMessage from "@/components/message/chatroom-voip-message.tsx";
import ContactMessage from "@/components/message/contact-message.tsx";
import ImageMessage from "@/components/message/image-message.tsx";
import LocationMessage from "@/components/message/location-message.tsx";
import MicroVideoMessage from "@/components/message/micro-video-message.tsx";
import StickerMessage from "@/components/message/sticker-message.tsx";
import SystemExtendedMessage from "@/components/message/system-extended-message.tsx";
import SystemMessage from "@/components/message/system-message.tsx";
import TextMessage from "@/components/message/text-message.tsx";
import VerityMessage from "@/components/message/verify-message.tsx";
import VideoMessage from "@/components/message/video-message.tsx";
import VoiceMessage from "@/components/message/voice-message.tsx";
import VoipMessage from "@/components/message/voip-message.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import {
  MessageDirection,
  MessageType,
  type Message as MessageVM,
} from "@/lib/schema.ts";
import { formatDateTime } from "@/lib/utils.ts";
import { ErrorBoundary } from "react-error-boundary";

export interface MessageProp<T = MessageVM>
  extends React.HTMLAttributes<HTMLDivElement> {
  message: T;
  direction: MessageDirection;
  variant?: "default" | "referenced" | "abstract";
  showPhoto: boolean;
  showUsername: boolean;
  [key: string]: unknown;
}

export default function Message({
  message,
  direction,
  variant = "default",
  ...props
}: MessageProp) {
  const { user } = useApp();

  if (message.direction === MessageDirection.outgoing && user)
    message.from = user;

  return (
    <ErrorBoundary
      onError={(e) => {
        console.error(e);
      }}
      fallback={
        <div
          onDoubleClick={() => {
            console.log(message);
          }}
        >
          解析失败的消息
        </div>
      }
    >
      <MessageComponent
        onDoubleClick={() => {
          console.log(message);
        }}
        message={message}
        variant={variant}
        direction={direction}
        title={formatDateTime(new Date(message.date * 1000))}
        {...props}
      />
    </ErrorBoundary>
  );
}

function MessageComponent({
  message,
  direction,
  variant,

  showPhoto = false,
  ...props
}: MessageProp) {
  switch (message.type) {
    case MessageType.TEXT:
      return (
        <TextMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.IMAGE:
      return (
        <ImageMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.VOICE:
      return (
        <VoiceMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.VERITY:
      return (
        <VerityMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.CONTACT:
      return (
        <ContactMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.VIDEO:
      return (
        <VideoMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.MICROVIDEO:
      return (
        <MicroVideoMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.STICKER:
      return (
        <StickerMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.LOCATION:
      return (
        <LocationMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.APP:
      return (
        <AppMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.VOIP:
      return (
        <VoipMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.GROUP_VOIP:
      return (
        <ChatroomVoipMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={showPhoto}
          {...props}
        />
      );

    case MessageType.SYSTEM:
      return (
        <SystemMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={false}
          {...props}
        />
      );

    case MessageType.SYSTEM_EXTENDED:
      return (
        <SystemExtendedMessage
          message={message}
          direction={direction}
          variant={variant}
          showPhoto={false}
          {...props}
        />
      );

    default:
      return <div>Unknown message type: {(message as MessageVM).type}</div>;
  }
}
