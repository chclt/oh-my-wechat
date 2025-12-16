import type { ForwardMessageRecordItemType } from "@/components/open-message/forward-message.tsx";
import { RecordTypeEnum } from "@/schema/record.ts";

export interface MessageRecordBaseType {
	"@_datatype": RecordTypeEnum;
	"@_dataid": string;
}

/** 转发的消息记录中的文本消息 */
export interface TextMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.TEXT;
	datadesc: string;
}

/** 转发的消息记录中的图片消息 */
export interface ImageMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.IMAGE;

	datafmt: string; // e.g. "pic"

	thumbsize: number;
	thumbfullmd5: string;

	datasize: number;
	fullmd5: string;
}

/** 转发的消息记录中的视频消息 */
export interface VideoMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.VIDEO;

	fullmd5: string;
	cdndatakey: string;
	cdndataurl: string;
	head256md5: string;
	datasize: number;

	thumbfullmd5: string;
	cdnthumbkey: string;
	cdnthumburl: string;
	thumbhead256md5: string;
	thumbsize: number;

	thumbfiletype: number; // 1 看起来是是图片
	datafmt: string;
	filetype: number; // 4 看起来是是视频
	duration: number; // 秒
}

/** 转发的消息记录中的链接卡片消息 */
export interface LinkMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.LINK;
	datatitle: string;
	datasize: number;
	link: string;
	weburlitem: {
		thumburl?: string;
		title: string;
		desc: string;
		link: string;
		appmsgshareitem?: {
			pubtime: number; // Unix时间戳
			srcdisplayname: string; // 公众号名称
			srcusername: string; // 公众号id
			cover: string;
		};
	};
}

/** 转发的消息记录中的位置消息 */
export interface LocationMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.LOCATION;
	locitem: {
		lng: number; // 经度
		buildingid: number; // 建筑ID？
		poiname: string;
		floorname: string; // e.g. "F2"
		label: string;
		isfrompoilist: number; // e.g. 1
		poiid: string; // e.g. "qqmap_00000000000000000000"
		lat: number; // 纬度
		scale: number; // 地图缩放比例
	};
}

/** 转发的消息记录中的附件消息 */
export interface AttachMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.ATTACH;
	datatitle: string;
	datasize: number;
}

/** 转发的消息记录中的名片消息 */
export interface ContactMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.CONTACT;
	datasize: number;
	datadesc: string; // xml
}

/** 转发的消息记录中的转发消息记录 */
export interface ForwardMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.FORWARD_MESSAGE;
	datatitle: string;
	datadesc: string;
	recordxml: {
		recordinfo: {
			datalist: {
				dataitem: ForwardMessageRecordItemType[];
			};
		};
	};
}

/** 转发的消息记录中的小程序消息 */
export interface MiniAppMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.MINIAPP;
	datatitle: string;
	appbranditem: {
		iconurl: string;
		type: number;
		sourcedisplayname: string;
		username: string;
		pagepath: string; // 小程序路径
	};
}

/** 转发的消息记录中的笔记消息 */
export interface NoteMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.NOTE;
	datatitle: string;
	datadesc: string;
	recordxml: unknown;
}

/** 转发的消息记录中的视频号视频消息 */
export interface ChannelVideoMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.CHANNEL_VIDEO;
	datatitle: string;
	datadesc: string;
	finderFeed: {
		username: string;
		mediaCount: number;
		nickname: string;
		objectNonceId: string;
		objectId: string;
		mediaList: {
			media: {
				height: number;
				mediaType: number; // e.g. 4 是视频?
				width: number;
				thumbUrl: string;
				videoPlayDuration: number; // 秒
				url: string;
			};
		};
		feedType: number; // 4 是视频？
		avatar: string;
		desc: string;
	};
}

/** 转发的消息记录中的直播卡片消息 */
export interface LiveMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.LIVE;
	datatitle: string;
	datadesc: string;
	finderLive: {
		liveFlagValue: string;
		headUrl: string;
		authIconUrl: string;
		chargeFlag: string;
		cellWidth: string;
		bizUsername: string;
		cellHeight: string;
		nickname: string;
		finderUsername: string;
		finderObjectID: string;
		finderNonceID: string;
		extFlag: string;
		liveSourceTypeStr: string;
		authIconTypeStr: string;
		authIconType: string;
		finderLiveStatus: string;
		bizNickname: string;
		media: {
			coverUrl: string;
			width: string;
			height: string;
		};
		bindType: string;
		liveStatus: string;
		desc: string;
		liveFlag: string;
		replayStatus: string;
		spamLiveExtFlagString: string;
		finderLiveID: string;
	};
}

/** 转发的消息记录中的视频号消息 */
export interface ChannelMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.CHANNEL;
	datatitle: string;
	datadesc: string;
	finderShareNameCard: {
		username: string;
		nickname: string;
		avatar: string;
	};
}

/** 转发的消息记录中的音乐分享消息 */
export interface MusicMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.MUSIC;
	datatitle: string;
	streamweburl: string;
	streamdataurl: string;
}

/** 转发的消息记录中的听一听分享消息 */
export interface TingMessageRecordType extends MessageRecordBaseType {
	"@_datatype": RecordTypeEnum.TING;

	datatitle: string;
	datadesc: string;

	streamweburl: string; // 如果是音乐，这个链接一般是前往QQ音乐，如果是音频，这个链接前往公众号文章
	songalbumurl: string;
	weburlitem: {
		thumburl: string;
		title: string;
	};

	// 如果是音乐会有下面的数据
	streamdataurl?: string;
	streamlowbandurl?: string;
	musicShareItem?: {
		mvSingerName: string;
		mid: string;
	};
}
