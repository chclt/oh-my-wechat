import { CircleQuestionmarkSolid } from "@/components/icon.tsx";
import { LinkCard } from "@/components/link-card.tsx";
import dialogClasses from "@/components/ui/dialog.module.css";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { cn } from "@/lib/utils.ts";
import { Dialog } from "@base-ui/react";
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
	type OpenMessageType,
} from "@repo/types";
import {
	AnnouncementMessage,
	Attach2Message,
	AttachMessage,
	ChannelMessage,
	ChannelVideoMessage,
	ForwardMessage,
	ForwardMessage2,
	GameMessage,
	LinkMessage2,
	LiveMessage,
	MiniappMessage,
	MiniappMessage2,
	MusicMessage,
	NoteMessage,
	PatMessage,
	RealtimeLocationMessage,
	RedEnvelopeMessage,
	ReferMessage,
	RingtoneMessage,
	ScanResultMessage,
	SolitaireMessage,
	StickerMessage,
	StickerSetMessage,
	StoreMessage,
	StoreProductMessage,
	TextMessage,
	TingMessage,
	TransferMessage,
	UrlMessage,
	VideoMessage,
	VoiceMessage,
} from "../../open-message";

interface OpenMessageProps {
	message: OpenMessageType<{
		type: number;
	}>;
	variant: "default" | "referenced" | "abstract";
}

export function OpenMessageAuto({
	message,
	variant,
	...props
}: OpenMessageProps) {
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
				<TextMessage.Auto
					message={message as unknown as OpenMessageType<TextOpenMessageEntity>}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.VOICE:
			return (
				<VoiceMessage.Auto
					message={
						message as unknown as OpenMessageType<VoiceOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);
		case OpenMessageTypeEnum.VIDEO:
			return (
				<VideoMessage.Auto
					message={
						message as unknown as OpenMessageType<VideoOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.ATTACH:
			return (
				<AttachMessage.Auto
					message={
						message as unknown as OpenMessageType<AttachOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);
		case OpenMessageTypeEnum.STICKER:
			return (
				<StickerMessage.Auto
					message={
						message as unknown as OpenMessageType<StickerOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.STICKER_SET:
			return (
				<StickerSetMessage.Auto
					message={
						message as unknown as OpenMessageType<StickerSetOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.REALTIME_LOCATION:
			return (
				<RealtimeLocationMessage.Auto
					message={
						message as unknown as OpenMessageType<RealtimeLocationOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.FORWARD_MESSAGE:
			return (
				<ForwardMessage.Auto
					message={
						message as unknown as OpenMessageType<ForwardOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.NOTE:
			return (
				<NoteMessage.Auto
					message={message as unknown as OpenMessageType<NoteOpenMessageEntity>}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.MINIAPP_2:
			return (
				<MiniappMessage2.Auto
					message={
						message as unknown as OpenMessageType<MiniApp2OpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.MINIAPP:
			return (
				<MiniappMessage.Auto
					message={
						message as unknown as OpenMessageType<MiniAppOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.FORWARD_MESSAGE_2:
			return (
				<ForwardMessage2.Auto
					message={
						message as unknown as OpenMessageType<Forward2OpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.CHANNEL:
			return (
				<ChannelMessage.Auto
					message={
						message as unknown as OpenMessageType<ChannelOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.CHANNEL_VIDEO:
			return (
				<ChannelVideoMessage.Auto
					message={
						message as unknown as OpenMessageType<ChannelVideoOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.SOLITAIRE:
			return (
				<SolitaireMessage.Auto
					message={
						message as unknown as OpenMessageType<SolitaireOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.REFER:
			return (
				<ReferMessage.Auto
					message={
						message as unknown as OpenMessageType<ReferOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);
		case OpenMessageTypeEnum.PAT:
			if (variant === "default" || variant === "abstract") {
				return (
					<PatMessage.Auto
						message={
							message as unknown as OpenMessageType<PatOpenMessageEntity>
						}
						variant={variant}
						{...props}
					/>
				);
			} else {
				console.error(`PatMessage does not support variant ${variant}`);
				return null;
			}

		case OpenMessageTypeEnum.LIVE:
			return (
				<LiveMessage.Auto
					message={message as unknown as OpenMessageType<LiveOpenMessageEntity>}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.LINK_2:
			return (
				<LinkMessage2.Auto
					message={
						message as unknown as OpenMessageType<Link2OpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.ATTACH_2:
			return (
				<Attach2Message.Auto
					// @ts-ignore
					message={
						message as unknown as OpenMessageType<Attach2OpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.MUSIC:
			return (
				<MusicMessage.Auto
					message={
						message as unknown as OpenMessageType<MusicOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.STORE_PRODUCT:
			return (
				<StoreProductMessage.Auto
					message={
						message as unknown as OpenMessageType<StoreProductOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.ANNOUNCEMENT:
			return (
				<AnnouncementMessage.Auto
					message={
						message as unknown as OpenMessageType<AnnouncementOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.TING:
			return (
				<TingMessage.Auto
					message={message as unknown as OpenMessageType<TingOpenMessageEntity>}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.GAME:
			return (
				<GameMessage.Auto
					message={message as unknown as OpenMessageType<GameOpenMessageEntity>}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.STORE:
			return (
				<StoreMessage.Auto
					message={
						message as unknown as OpenMessageType<StoreOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.TRANSFER:
			return (
				<TransferMessage.Auto
					message={
						message as unknown as OpenMessageType<TransferOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);
		case OpenMessageTypeEnum.RED_ENVELOPE:
			return (
				<RedEnvelopeMessage.Auto
					message={
						message as unknown as OpenMessageType<RedEnvelopeOpenMessageEntity>
					}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.URL:
			return (
				<UrlMessage.Auto
					message={message as unknown as OpenMessageType<UrlOpenMessageEntity>}
					variant={variant}
					{...props}
				/>
			);

		case OpenMessageTypeEnum.SCAN_RESULT:
			if (variant === "default" || variant === "abstract") {
				return (
					<ScanResultMessage.Auto
						message={
							message as unknown as OpenMessageType<ScanResultOpenMessageEntity>
						}
						variant={variant}
						{...props}
					/>
				);
			} else {
				console.error(`ScanResultMessage does not support variant ${variant}`);
				return null;
			}

		case OpenMessageTypeEnum.RINGTONE:
			return (
				<RingtoneMessage.Auto
					message={
						message as unknown as OpenMessageType<RingtoneOpenMessageEntity>
					}
					variant={variant}
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
