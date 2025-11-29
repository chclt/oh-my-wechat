import type { ChatroomVoipMessageEntity } from "@/components/message/chatroom-voip-message.tsx";
import type { ContactMessageEntity } from "@/components/message/contact-message.tsx";
import type { ImageMessageEntity } from "@/components/message/image-message.tsx";
import type { LocationMessageEntity } from "@/components/message/location-message.tsx";
import type { MailMessageEntity } from "@/components/message/mail-message.tsx";
import type { MicroVideoMessageEntity } from "@/components/message/micro-video-message.tsx";
import type { StickerMessageEntity } from "@/components/message/sticker-message.tsx";
import type { SystemExtendedMessageEntity } from "@/components/message/system-extended-message.tsx";
import type { SystemMessageEntity } from "@/components/message/system-message.tsx";
import type { TextMessageEntity } from "@/components/message/text-message.tsx";
import type { VerityMessageEntity } from "@/components/message/verify-message.tsx";
import type { VideoMessageEntity } from "@/components/message/video-message.tsx";
import type { VoiceMessageEntity } from "@/components/message/voice-message.tsx";
import type { VoipMessageEntity } from "@/components/message/voip-message.tsx";
import type { WeComContactMessageEntity } from "@/components/message/wecom-contact-message.tsx";
import type { OpenMessageEntity } from "@/components/open-message/open-message.tsx";
import type { ChatType, UserType } from "@/schema/index.ts";

export enum MessageDirection {
	outgoing = 0,
	incoming = 1,
}

export enum MessageTypeEnum {
	TEXT = 1, // 文本消息
	IMAGE = 3, // 图片消息
	VOICE = 34, // 语音消息
	MAIL = 35, // QQ 邮箱邮件消息
	VERITY = 37, // 验证消息
	CONTACT = 42, // 名片消息（人/公众号）
	VIDEO = 43, // 视频消息
	STICKER = 47, // 表情
	LOCATION = 48, // 位置消息
	APP = 49, // 好多可能，里面还有类型
	VOIP = 50, // 语音/视频通话
	MICROVIDEO = 62, // 也是视频
	GROUP_VOIP = 64, // 群语音/视频通话 TODO: 可能是通知
	WECOM_CONTACT = 66, // 企业微信名片
	SYSTEM = 10000, // 系统消息,应该只是文本
	SYSTEM_EXTENDED = 10002,

	OMW_ERROR = "OMW_ERROR",
}

export interface BasicMessageType<
	MessageTypeEnumType extends MessageTypeEnum | unknown,
	MessageEntityType,
> {
	id: string; // Message server id
	local_id: string;
	type: MessageTypeEnumType;
	from: UserType;
	date: number;
	direction: MessageDirection;
	message_entity: MessageEntityType;
	reply_to_message?: MessageType;
	chat_id: ChatType["id"]; // Chat the message belongs to
	raw_message: string;
}

export type TextMessageType = BasicMessageType<
	MessageTypeEnum.TEXT,
	TextMessageEntity
>;
export type ImageMessageType = BasicMessageType<
	MessageTypeEnum.IMAGE,
	ImageMessageEntity
>;
export type VoiceMessageType = BasicMessageType<
	MessageTypeEnum.VOICE,
	VoiceMessageEntity
>;
export type MailMessageType = BasicMessageType<
	MessageTypeEnum.MAIL,
	MailMessageEntity
>;
export type ContactMessageType = BasicMessageType<
	MessageTypeEnum.CONTACT,
	ContactMessageEntity
>;
export type VideoMessageType = BasicMessageType<
	MessageTypeEnum.VIDEO,
	VideoMessageEntity
>;
export type StickerMessageType = BasicMessageType<
	MessageTypeEnum.STICKER,
	StickerMessageEntity
>;
export type LocationMessageType = BasicMessageType<
	MessageTypeEnum.LOCATION,
	LocationMessageEntity
>;
export type OpenMessageType<
	OpenMessageEntityType = {
		type: unknown;
	},
> = BasicMessageType<
	MessageTypeEnum.APP,
	OpenMessageEntity<OpenMessageEntityType>
>;
export type VoipMessageType = BasicMessageType<
	MessageTypeEnum.VOIP,
	VoipMessageEntity
>;
export type MicroVideoMessageType = BasicMessageType<
	MessageTypeEnum.MICROVIDEO,
	MicroVideoMessageEntity
>;
export type ChatroomVoipMessageType = BasicMessageType<
	MessageTypeEnum.GROUP_VOIP,
	ChatroomVoipMessageEntity
>;
export type WeComContactMessageType = BasicMessageType<
	MessageTypeEnum.WECOM_CONTACT,
	WeComContactMessageEntity
>;
export type SystemMessageType = BasicMessageType<
	MessageTypeEnum.SYSTEM,
	SystemMessageEntity
>;
export type SystemExtendedMessageType = BasicMessageType<
	MessageTypeEnum.SYSTEM_EXTENDED,
	SystemExtendedMessageEntity
>;
// Special Message Type
export type VerityMessageType = Omit<
	BasicMessageType<MessageTypeEnum.VERITY, VerityMessageEntity>,
	"from" | "chat_id"
>;
export type OMWErrorMessageType = BasicMessageType<
	MessageTypeEnum.OMW_ERROR,
	TextMessageEntity
>;

export type MessageType =
	| TextMessageType
	| ImageMessageType
	| VoiceMessageType
	| MailMessageType
	| ContactMessageType
	| VideoMessageType
	| StickerMessageType
	| LocationMessageType
	| OpenMessageType
	| VoipMessageType
	| MicroVideoMessageType
	| ChatroomVoipMessageType
	| WeComContactMessageType
	| SystemMessageType
	| SystemExtendedMessageType
	| OMWErrorMessageType;
