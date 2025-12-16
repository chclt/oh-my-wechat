export * from "./message";
export * from "./note-record.ts";
export * from "./record";

import { MessageType } from "./message";

export interface ContactType {
	id: string;
	username: string;
	usernamePinyin: string;

	remark?: string;
	remarkPinyin?: string;
	remarkPinyinInits?: string;

	photo?: {
		origin?: string;
		thumb: string;
	};
	is_openim: boolean;
}

export interface UserType {
	id: string; // wxid
	user_id: string;
	username: string;
	remark?: string;
	bio?: string;
	photo?: {
		origin?: string;
		thumb: string;
	};
	background?: string; // 朋友圈背景
	phone?: string;
	is_openim: boolean;
}

export interface AccountType extends UserType {}

export interface ChatroomType {
	id: `${string}@chatroom`;
	title: string;
	remark?: string;
	photo?: {
		origin?: string;
		thumb: string;
	};

	members: UserType[];
	is_openim: boolean;
}

interface BasicChatType {
	id: string;
	title: string;
	photo?: string;
	last_message?: MessageType;
	is_muted: boolean;
	is_pinned: boolean;
	is_collapsed: boolean;
	members: UserType[];
	background?: string;
}

export interface PrivateChatType extends BasicChatType {
	type: "private";
	user: UserType;
}

export interface GroupChatType extends BasicChatType {
	type: "chatroom";
	chatroom: ChatroomType;
}

export type ChatType = PrivateChatType | GroupChatType;

export type ImageInfo = Partial<
	Record<
		"regular" | "thumbnail" | "hd",
		{
			src: string;
			width?: number;
			height?: number;
		}
	>
>;

export interface VideoInfo {
	src: string;
	width?: number;
	height?: number;
	cover?: ImageInfo[keyof ImageInfo];
}

export interface VoiceInfo {
	src?: string;
	raw_aud_src: string;
	transcription?: string;
	file_size?: number;
}

export interface FileInfo {
	src: string;
}
