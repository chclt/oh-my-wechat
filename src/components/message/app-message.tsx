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
import { AppMessageTypeEnum, type AppMessageType } from "@/schema";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LinkCard } from "@/components/link-card";
import { CircleQuestionmarkSolid } from "@/components/icon";

export type AppMessageProps<
	T = {
		type: 0;
	},
> = MessageProp<AppMessageType<T>>;

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
		case AppMessageTypeEnum.TEXT:
			return (
				<TextMessage
					message={message as unknown as AppMessageType<AppTextMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.VOICE:
			return (
				<VoiceMessage
					message={message as unknown as AppMessageType<VoiceMessageEntity>}
					{...props}
				/>
			);
		case AppMessageTypeEnum.VIDEO:
			return (
				<VideoMessage
					message={message as unknown as AppMessageType<VideoMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.ATTACH:
			return (
				<AttachMessage
					message={message as unknown as AppMessageType<AttachMessageEntity>}
					{...props}
				/>
			);
		case AppMessageTypeEnum.STICKER:
			return (
				<StickerMessage
					message={message as unknown as AppMessageType<StickerMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.STICKER_SET:
			return (
				<StickerSetMessage
					message={
						message as unknown as AppMessageType<StickerSetMessageEntity>
					}
					{...props}
				/>
			);

		case AppMessageTypeEnum.REALTIME_LOCATION:
			return (
				<RealtimeLocationMessage
					message={
						message as unknown as AppMessageType<RealtimeLocationMessageEntity>
					}
					{...props}
				/>
			);

		case AppMessageTypeEnum.FORWARD_MESSAGE:
			return (
				<ForwardMessage
					message={message as unknown as AppMessageType<ForwardMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.NOTE:
			return (
				<NoteMessage
					message={message as unknown as AppMessageType<NoteMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.MINIAPP_2:
			return (
				<MiniappMessage2
					message={message as unknown as AppMessageType<MiniappMessage2Entity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.MINIAPP:
			return (
				<MiniappMessage
					message={message as unknown as AppMessageType<MiniappMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.FORWARD_MESSAGE_2:
			return (
				<ForwardMessage2
					message={message as unknown as AppMessageType<ForwardMessage2Entity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.CHANNEL:
			return (
				<ChannelMessage
					message={message as unknown as AppMessageType<ChannelMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.CHANNEL_VIDEO:
			return (
				<ChannelVideoMessage
					message={
						message as unknown as AppMessageType<ChannelVideoMessageEntity>
					}
					{...props}
				/>
			);

		case AppMessageTypeEnum.SOLITAIRE:
			return (
				<SolitaireMessage
					message={message as unknown as AppMessageType<SolitaireMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.REFER:
			return (
				<ReferMessage
					message={message as unknown as AppMessageType<ReferMessageEntity>}
					{...props}
				/>
			);
		case AppMessageTypeEnum.PAT:
			return (
				<PatMessage
					message={message as unknown as AppMessageType<PatMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.LIVE:
			return (
				<LiveMessage
					message={message as unknown as AppMessageType<LiveMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.LINK_2:
			return (
				<LinkMessage2
					message={message as unknown as AppMessageType<LinkMessage2Entity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.ATTACH_2:
			return (
				<Attach2Message
					message={message as unknown as AppMessageType<AttachMessage2Entity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.MUSIC:
			return (
				<MusicMessage
					message={message as unknown as AppMessageType<MusicMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.STORE_PRODUCT:
			return (
				<StoreProductMessage
					message={
						message as unknown as AppMessageType<StoreProductMessageEntity>
					}
					{...props}
				/>
			);

		case AppMessageTypeEnum.ANNOUNCEMENT:
			return (
				<AnnouncementMessage
					message={
						message as unknown as AppMessageType<AnnouncementMessageEntity>
					}
					{...props}
				/>
			);

		case AppMessageTypeEnum.TING:
			return (
				<TingMessage
					message={message as unknown as AppMessageType<TingMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.GAME:
			return (
				<GameMessage
					message={message as unknown as AppMessageType<GameMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.STORE:
			return (
				<StoreMessage
					message={message as unknown as AppMessageType<StoreMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.TRANSFER:
			return (
				<TransferMessage
					message={message as unknown as AppMessageType<TransferMessageEntity>}
					{...props}
				/>
			);
		case AppMessageTypeEnum.RED_ENVELOPE:
			return (
				<RedEnvelopeMessage
					message={
						message as unknown as AppMessageType<RedEnvelopeMessageEntity>
					}
					{...props}
				/>
			);

		case AppMessageTypeEnum.URL:
			return (
				<UrlMessage
					message={message as unknown as AppMessageType<UrlMessageEntity>}
					{...props}
				/>
			);

		case AppMessageTypeEnum.SCAN_RESULT:
			return (
				<ScanResultMessage
					message={
						message as unknown as AppMessageType<ScanResultMessageEntity>
					}
					{...props}
				/>
			);

		case AppMessageTypeEnum.RINGTONE:
			return (
				<RingtoneMessage
					message={message as unknown as AppMessageType<RingtoneMessageEntity>}
					{...props}
				/>
			);

		default:
			return (
				<Dialog>
					<DialogTrigger className="text-start">
						<LinkCard
							abstract="暂未支持的消息类型，点击查看原始数据"
							from={`49:${message.message_entity.msg.appmsg.type}`}
							icon={<CircleQuestionmarkSolid className=" scale-[135%]" />}
						/>
					</DialogTrigger>
					<DialogContent>
						<ScrollArea className="max-w-full overflow-hidden">
							<pre className="text-sm pb-4">{message.raw_message}</pre>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
					</DialogContent>
				</Dialog>
			);
	}
}
