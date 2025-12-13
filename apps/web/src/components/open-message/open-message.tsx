import { CircleQuestionmarkSolid } from "@/components/icon.tsx";
import { LinkCard } from "@/components/link-card.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import AnnouncementMessage from "@/components/open-message/announcement-message.tsx";
import Attach2Message from "@/components/open-message/attach-2-message.tsx";
import AttachMessage from "@/components/open-message/attach-message.tsx";
import ChannelMessage from "@/components/open-message/channel-message.tsx";
import ChannelVideoMessage from "@/components/open-message/channel-video-message.tsx";
import ForwardMessage2 from "@/components/open-message/forward-message-2.tsx";
import ForwardMessage from "@/components/open-message/forward-message.tsx";
import GameMessage from "@/components/open-message/game-message.tsx";
import LinkMessage2 from "@/components/open-message/link-message-2.tsx";
import LiveMessage from "@/components/open-message/live-message.tsx";
import MiniappMessage2 from "@/components/open-message/miniapp-message-2.tsx";
import MiniappMessage from "@/components/open-message/miniapp-message.tsx";
import MusicMessage from "@/components/open-message/music-message.tsx";
import NoteMessage from "@/components/open-message/note-message.tsx";
import PatMessage from "@/components/open-message/pat-message.tsx";
import RealtimeLocationMessage from "@/components/open-message/realtime-location-message.tsx";
import RedEnvelopeMessage from "@/components/open-message/red-envelope-message.tsx";
import ReferMessage from "@/components/open-message/refer-message.tsx";
import RingtoneMessage from "@/components/open-message/ringtone-message.tsx";
import ScanResultMessage from "@/components/open-message/scan-result-message.tsx";
import SolitaireMessage from "@/components/open-message/solitaire-message.tsx";
import StickerMessage from "@/components/open-message/sticker-message.tsx";
import StickerSetMessage from "@/components/open-message/sticker-set-message.tsx";
import StoreMessage from "@/components/open-message/store-message.tsx";
import StoreProductMessage from "@/components/open-message/store-product-message.tsx";
import TextMessage from "@/components/open-message/text-message.tsx";
import TingMessage from "@/components/open-message/ting-message.tsx";
import TransferMessage from "@/components/open-message/transfer-message.tsx";
import UrlMessage from "@/components/open-message/url-message.tsx";
import VideoMessage from "@/components/open-message/video-message.tsx";
import VoiceMessage from "@/components/open-message/voice-message.tsx";
import dialogClasses from "@/components/ui/dialog.module.css";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { cn } from "@/lib/utils.ts";
import { type OpenMessageType } from "@/schema";
import {
	AnnouncementOpenMessageEntity,
	Attach2OpenMessageEntity,
	AttachOpenMessageEntity,
	ChannelOpenMessageEntity,
	ChannelVideoOpenMessageEntity,
	Forward2OpenMessageEntity,
	ForwardOpenMessageEntity,
	GameOpenMessageEntity,
	Link2OpenMessageEntity,
	LiveOpenMessageEntity,
	MiniApp2OpenMessageEntity,
	MiniAppOpenMessageEntity,
	MusicOpenMessageEntity,
	NoteOpenMessageEntity,
	OpenMessageTypeEnum,
	PatOpenMessageEntity,
	RealtimeLocationOpenMessageEntity,
	RedEnvelopeOpenMessageEntity,
	ReferOpenMessageEntity,
	RingtoneOpenMessageEntity,
	ScanResultOpenMessageEntity,
	SolitaireOpenMessageEntity,
	StickerOpenMessageEntity,
	StickerSetOpenMessageEntity,
	StoreOpenMessageEntity,
	StoreProductOpenMessageEntity,
	TextOpenMessageEntity,
	TingOpenMessageEntity,
	TransferOpenMessageEntity,
	UrlOpenMessageEntity,
	VideoOpenMessageEntity,
	VoiceOpenMessageEntity,
} from "@/schema/open-message.ts";
import { Dialog } from "@base-ui/react";

export type OpenMessageProps<
	T = {
		type: 0; 
	},
> = MessageProp<OpenMessageType<T>>;

export interface OpenMessageEntity<
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

export default function OpenMessage({
	message,
	...props
}: OpenMessageProps<{
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
		case OpenMessageTypeEnum.TEXT:
			return (
				<TextMessage
					message={message as unknown as OpenMessageType<TextOpenMessageEntity>}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.VOICE:
			return (
				<VoiceMessage
					message={
						message as unknown as OpenMessageType<VoiceOpenMessageEntity>
					}
					{...props}
				/>
			);
		case OpenMessageTypeEnum.VIDEO:
			return (
				<VideoMessage
					message={
						message as unknown as OpenMessageType<VideoOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.ATTACH:
			return (
				<AttachMessage
					message={
						message as unknown as OpenMessageType<AttachOpenMessageEntity>
					}
					{...props}
				/>
			);
		case OpenMessageTypeEnum.STICKER:
			return (
				<StickerMessage
					message={
						message as unknown as OpenMessageType<StickerOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.STICKER_SET:
			return (
				<StickerSetMessage
					message={
						message as unknown as OpenMessageType<StickerSetOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.REALTIME_LOCATION:
			return (
				<RealtimeLocationMessage
					message={
						message as unknown as OpenMessageType<RealtimeLocationOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.FORWARD_MESSAGE:
			return (
				<ForwardMessage
					message={
						message as unknown as OpenMessageType<ForwardOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.NOTE:
			return (
				<NoteMessage
					message={message as unknown as OpenMessageType<NoteOpenMessageEntity>}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.MINIAPP_2:
			return (
				<MiniappMessage2
					message={
						message as unknown as OpenMessageType<MiniApp2OpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.MINIAPP:
			return (
				<MiniappMessage
					message={
						message as unknown as OpenMessageType<MiniAppOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.FORWARD_MESSAGE_2:
			return (
				<ForwardMessage2
					message={
						message as unknown as OpenMessageType<Forward2OpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.CHANNEL:
			return (
				<ChannelMessage
					message={
						message as unknown as OpenMessageType<ChannelOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.CHANNEL_VIDEO:
			return (
				<ChannelVideoMessage
					message={
						message as unknown as OpenMessageType<ChannelVideoOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.SOLITAIRE:
			return (
				<SolitaireMessage
					message={
						message as unknown as OpenMessageType<SolitaireOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.REFER:
			return (
				<ReferMessage
					message={
						message as unknown as OpenMessageType<ReferOpenMessageEntity>
					}
					{...props}
				/>
			);
		case OpenMessageTypeEnum.PAT:
			return (
				<PatMessage
					message={message as unknown as OpenMessageType<PatOpenMessageEntity>}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.LIVE:
			return (
				<LiveMessage
					message={message as unknown as OpenMessageType<LiveOpenMessageEntity>}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.LINK_2:
			return (
				<LinkMessage2
					message={
						message as unknown as OpenMessageType<Link2OpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.ATTACH_2:
			return (
				<Attach2Message
					message={
						message as unknown as OpenMessageType<Attach2OpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.MUSIC:
			return (
				<MusicMessage
					message={
						message as unknown as OpenMessageType<MusicOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.STORE_PRODUCT:
			return (
				<StoreProductMessage
					message={
						message as unknown as OpenMessageType<StoreProductOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.ANNOUNCEMENT:
			return (
				<AnnouncementMessage
					message={
						message as unknown as OpenMessageType<AnnouncementOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.TING:
			return (
				<TingMessage
					message={message as unknown as OpenMessageType<TingOpenMessageEntity>}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.GAME:
			return (
				<GameMessage
					message={message as unknown as OpenMessageType<GameOpenMessageEntity>}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.STORE:
			return (
				<StoreMessage
					message={
						message as unknown as OpenMessageType<StoreOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.TRANSFER:
			return (
				<TransferMessage
					message={
						message as unknown as OpenMessageType<TransferOpenMessageEntity>
					}
					{...props}
				/>
			);
		case OpenMessageTypeEnum.RED_ENVELOPE:
			return (
				<RedEnvelopeMessage
					message={
						message as unknown as OpenMessageType<RedEnvelopeOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.URL:
			return (
				<UrlMessage
					message={message as unknown as OpenMessageType<UrlOpenMessageEntity>}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.SCAN_RESULT:
			return (
				<ScanResultMessage
					message={
						message as unknown as OpenMessageType<ScanResultOpenMessageEntity>
					}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.RINGTONE:
			return (
				<RingtoneMessage
					message={
						message as unknown as OpenMessageType<RingtoneOpenMessageEntity>
					}
					{...props}
				/>
			);

		default:
			return (
				<Dialog.Root>
					<Dialog.Trigger className="text-start">
						<LinkCard
							abstract="暂未支持的消息类型，点击查看原始数据"
							from={`49:${message.message_entity.msg.appmsg.type}`}
							icon={<CircleQuestionmarkSolid className=" scale-[135%]" />}
						/>
					</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Backdrop className={dialogClasses.Backdrop} />
						<Dialog.Popup
							className={cn(
								dialogClasses.Popup,
								"w-md max-h-[calc(100%-6rem)] h-96",
							)}
						>
							<ScrollArea className="size-full overflow-hidden">
								<div className="p-4">
									<pre className="w-full text-sm pb-4 break-all whitespace-break-spaces">
										{message.raw_message}
									</pre>
								</div>
							</ScrollArea>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			);
	}
}
