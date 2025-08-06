import type { TextMessageEntity } from "@/components/message/text-message.tsx";
import type { ImageMessageEntity } from "@/components/message/image-message.tsx";
import type { VoiceMessageEntity } from "@/components/message/voice-message.tsx";
import type { MailMessageEntity } from "@/components/message/mail-message.tsx";
import type { VerityMessageEntity } from "@/components/message/verify-message.tsx";
import type { ContactMessageEntity } from "@/components/message/contact-message.tsx";
import type { VideoMessageEntity } from "@/components/message/video-message.tsx";
import type { StickerMessageEntity } from "@/components/message/sticker-message.tsx";
import type { LocationMessageEntity } from "@/components/message/location-message.tsx";
import type { AppMessageEntity } from "@/components/message/app-message.tsx";
import type { VoipMessageEntity } from "@/components/message/voip-message.tsx";
import type { MicroVideoMessageEntity } from "@/components/message/micro-video-message.tsx";
import type { ChatroomVoipMessageEntity } from "@/components/message/chatroom-voip-message.tsx";
import type { WeComContactMessageEntity } from "@/components/message/wecom-contact-message.tsx";
import type { SystemMessageEntity } from "@/components/message/system-message.tsx";
import type { SystemExtendedMessageEntity } from "@/components/message/system-extended-message.tsx";
import type { ChatType, MessageDirection, UserType } from "@/schema/index.ts";

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

export enum AppMessageTypeEnum {
	TEXT = 1,
	IMAGE = 2,
	VOICE = 3,
	VIDEO = 4,
	URL = 5, // 链接、小程序通知
	ATTACH = 6,
	STICKER = 8, // 表情贴纸
	STICKER_SET = 15, // 表情贴纸包
	REALTIME_LOCATION = 17,
	FORWARD_MESSAGE = 19,
	NOTE = 24, // 笔记
	MINIAPP = 33, // 小程序
	MINIAPP_2 = 36, // 小程序，不知道区别
	FORWARD_MESSAGE_2 = 40,
	CHANNEL = 50, // 频道名片
	CHANNEL_VIDEO = 51, // 频道视频
	SOLITAIRE = 53, // 接龙
	REFER = 57, // 回复消息
	PAT = 62, // 拍一拍
	LIVE = 63,
	LINK_2 = 68, // 另一个链接，微信里面和 5 的区别应该是这是一个用Webview呈现的链接
	ATTACH_2 = 74, // 文件，不知道区别
	MUSIC = 76, // 音乐链接
	STORE_PRODUCT = 82, // 微信小店商品
	ANNOUNCEMENT = 87, // 群公告
	TING = 92, // 微信内置音频平台的音频
	GAME = 101,
	STORE = 111, // 微信小店
	RINGTONE = 996, // 系统提示朋友的铃声
	SCAN_RESULT = 998, // 扫码结果
	TRANSFER = 2000, // 转账
	RED_ENVELOPE = 2001, // 红包、AA 收款
	RED_ENVELOPE_COVER = 2003, // 红包封面
}

export enum RecordTypeEnum {
	TEXT = 1,
	IMAGE = 2,
	AUDIO = 3,
	VIDEO = 4,
	LINK = 5,
	LOCATION = 6,
	ATTACH = 8,
	CONTACT = 16,
	FORWARD_MESSAGE = 17,
	MINIAPP = 19,
	NOTE = 21,
	CHANNEL_VIDEO = 22,
	LIVE = 23,
	CHANNEL = 26,
	MUSIC = 29,
	TING = 32,
}

export interface BasicMessageType<T extends MessageTypeEnum, S> {
	id: string; // Message server id
	local_id: string;
	type: T;
	from: UserType;
	date: number;
	direction: MessageDirection;
	chat: ChatType; // Chat the message belongs to
	message_entity: S;
	reply_to_message?: MessageType;
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
export type VerityMessageType = BasicMessageType<
	MessageTypeEnum.VERITY,
	VerityMessageEntity
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
export type AppMessageType<
	T = {
		type: unknown;
	},
> = BasicMessageType<MessageTypeEnum.APP, AppMessageEntity<T>>;
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
export type OMWErrorMessageType = BasicMessageType<
	MessageTypeEnum.OMW_ERROR,
	TextMessageEntity
>;

export type MessageType =
	| TextMessageType
	| ImageMessageType
	| VoiceMessageType
	| MailMessageType
	| VerityMessageType
	| ContactMessageType
	| VideoMessageType
	| StickerMessageType
	| LocationMessageType
	| AppMessageType
	| VoipMessageType
	| MicroVideoMessageType
	| ChatroomVoipMessageType
	| WeComContactMessageType
	| SystemMessageType
	| SystemExtendedMessageType
	| OMWErrorMessageType;
