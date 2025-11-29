export enum OpenMessageTypeEnum {
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

export interface TextOpenMessageEntity {
	type: OpenMessageTypeEnum.TEXT;
	title: string;
	des: string; // eg. a link
}

export interface VoiceOpenMessageEntity {
	type: OpenMessageTypeEnum.VOICE;
	title: string;
	des: string;
	username: string;
	action: string;
	url: string;
	lowurl: string;
	dataurl: string;
	lowdataurl: string;
	statextstr: string;
	songalbumurl: string;
	songlyric: string;
	musicShareItem: {
		mvCoverUrl: string;
		musicDuration: number;
		mid: string;
	};
}

export interface VideoOpenMessageEntity {
	type: OpenMessageTypeEnum.VIDEO;
	title: string;
	des: string;
	url: string;
	lowurl: string;
	appattach: {
		totallen: number;
		attachid: string;
		emoticonmd5: string;
		fileext: string;
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbwidth: number;
		cdnthumbheight: number;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: 0 | 1;
		filekey: string;
	};
}

export interface UrlOpenMessageEntity {
	type: OpenMessageTypeEnum.URL;
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

export interface AttachOpenMessageEntity {
	type: OpenMessageTypeEnum.ATTACH;
	title: string;
	des: string;
	appattach: {
		totallen: number | number[];
		fileext: string;
		attachid: string;
		cdnattachurl: string;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: number;
		filekey: `${string}_${string}_${string}`;
		overwrite_newmsgid: string;
		fileuploadtoken: string;
	};
	md5: string;
	recorditem: string;
	uploadpercent: number;
	"@_appid": string;
	"@_sdkver": string;
}

export interface StickerOpenMessageEntity {
	type: OpenMessageTypeEnum.STICKER;
	title: string;
	appattach: {
		totallen: number;
		attachid: string;
		cdnattachurl: string;
		emoticonmd5: string;
		aeskey: string;
		fileext: string;
		islargefilemsg: number;
		cdnthumburl: string;
		cdnthumbaeskey: string;
		cdnthumblength: number;
		cdnthumbwidth: number;
		cdnthumbheight: number;
		cdnthumbmd5: string;
	};
}

export interface StickerSetOpenMessageEntity {
	type: OpenMessageTypeEnum.STICKER_SET;
	title: string;
	des: string;
	url: string;
	thumburl: string;
	emoticonshared: {
		packageflag: 0;
		packageid: string;
	};
}

export interface RealtimeLocationOpenMessageEntity {
	type: OpenMessageTypeEnum.REALTIME_LOCATION;
	title: string; // eg. "我发起了位置共享"
}

export interface ForwardOpenMessageEntity {
	type: OpenMessageTypeEnum.FORWARD_MESSAGE;
	title: string;
	des: string;
	recorditem: string;
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
	md5: string;
}

export interface NoteOpenMessageEntity {
	type: OpenMessageTypeEnum.NOTE;
	title: string;

	des: string;

	appattach: {
		totallen: number;
		attachid: string;
		emoticonmd5: string;
		fileext: string; // 注意：微信文件里存在 ..htm的文件，两个点
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbwidth: number;
		cdnthumbheight: number;
		cdnthumbaeskey: string;
		aeskey: string;
	};
	recorditem: string; // xml
}

export interface MiniAppOpenMessageEntity {
	type: OpenMessageTypeEnum.MINIAPP;
	title: string;
	des: string;
	url: string;
	appattach: {
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbwidth: number;
		cdnthumbheight: number;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: number;
		filekey: string;
	};
	sourceusername: string;
	sourcedisplayname: string;
	md5: string;
	recorditem: string;
	uploadpercent: number;
	weappinfo: {
		username: string;
		appid: string;
		type: number;
		version: number;
		weappiconurl: string;
		pagepath: string;
		shareId: string;
		pkginfo: {
			type: number;
			md5: string;
		};
		appservicetype: number;
		brandofficialflag: number;
		showRelievedBuyFlag: number;
		subType: number;
		isprivatemessage: number;
	};
	"@_appid": string;
	"@_sdkver": string;
}

export interface MiniApp2OpenMessageEntity {
	type: OpenMessageTypeEnum.MINIAPP_2;
	title: string;
	des: string;
	url: string;
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
	sourceusername: string;
	sourcedisplayname: string;
	md5: string;
	weappinfo: {
		pagepath: string;
		username: string;
		appid: string;
		version: number;
		type: number;
		weappiconurl: string;
		shareId: string;
		appservicetype: number;
		secflagforsinglepagemode: number;
		videopageinfo: {
			thumbwidth: number;
			thumbheight: number;
			fromopensdk: number;
		};
	};
}

export interface Forward2OpenMessageEntity {
	type: OpenMessageTypeEnum.FORWARD_MESSAGE_2;
	title: string;
	des: string;
	thumburl: "";
	xmlfulllen: 120685;
	realinnertype: 19;
}

export interface ChannelOpenMessageEntity {
	type: OpenMessageTypeEnum.CHANNEL;
	title: string;
	url: string;
	findernamecard: {
		username: string;
		avatar: string;
		nickname: string;
		auth_job: string;
		auth_icon: number;
		auth_icon_url: string;
		ecSource: string;
		content_type: number;
		lastGMsgID: string;
	};
}

export interface ChannelVideoOpenMessageEntity {
	type: OpenMessageTypeEnum.CHANNEL_VIDEO;
	title: string;
	finderFeed: {
		objectId: string;
		feedType: number;
		nickname: string;
		avatar: string;
		desc: string;
		mediaCount: number;
		objectNonceId: string;
		liveId: number;
		username: string;
		authIconUrl: string;
		authIconType: number;
		mediaList: {
			media: {
				thumbUrl: string;
				fullCoverUrl: string;
				videoPlayDuration: number;
				url: string;
				coverUrl: string;
				height: number;
				mediaType: number;
				fullClipInset: string;
				width: number;
			};
		};
		megaVideo: {
			objectId: string;
			objectNonceId: string;
		};
		bizUsername: string;
		bizNickname: string;
		bizAvatar: string;
		bizUsernameV2: string;
		bizAuthIconUrl: string;
		bizAuthIconType: number;
	};
}

export interface SolitaireOpenMessageEntity {
	type: OpenMessageTypeEnum.SOLITAIRE;
	title: string;
	des: string;
	extinfo: {
		solitaire_info: string; // xml
	};
}

export interface ReferOpenMessageEntity {
	type: OpenMessageTypeEnum.REFER;
	title: string;
	refermsg: {
		type: number;
		svrid: string;
		fromusr: string;
		chatusr: string;
		displayname: string;
		msgsource: string; // xml
		content: string;
	};
}

export interface PatOpenMessageRecord {
	svrId: string;
	pattedUser: string;
	templete: string;
	fromUser: string;
	createTime: number;
}

export interface PatOpenMessageEntity {
	type: OpenMessageTypeEnum.PAT;
	title: string;
	patMsg: {
		records: {
			record: PatOpenMessageRecord | PatOpenMessageRecord[];
			recordNum: number;
		};
		chatUser: string;
	};
}

export interface LiveOpenMessageEntity {
	type: OpenMessageTypeEnum.LIVE;
	title: string;
	finderLive: {
		finderLiveID: string;
		finderUsername: string;
		finderObjectID: string;
		finderNonceID: string;
		nickname: string;
		headUrl: string;
		liveNickname: string;
		liveUsername: string;
		liveFlag: number;
		media: {
			coverUrl: string;
			height: number;
			width: number;
		};
		chatroomId: string;
	};
}

export interface Link2OpenMessageEntity {
	type: OpenMessageTypeEnum.LINK_2;
	title: string;
	des: string;
	url: string;
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
	sourceusername: string;
	sourcedisplayname: string;
	md5: string;
	weappinfo: {
		pagepath: string;
		username: string;
		appid: string;
		version: number;
		type: number;
		weappiconurl: string;
		shareId: string;
		appservicetype: number;
		secflagforsinglepagemode: number;
		videopageinfo: {
			thumbwidth: number;
			thumbheight: number;
			fromopensdk: number;
		};
	};
}

export interface Attach2OpenMessageEntity {
	type: OpenMessageTypeEnum.ATTACH_2;
	title: string;
	des: string;
	md5: string;
	laninfo: string;
	appattach: {
		totallen: number;
		fileext: string;
		fileuploadtoken: string;
		status: number;
	};
}

export interface MusicOpenMessageEntity {
	type: OpenMessageTypeEnum.MUSIC;
	title: string;
	des: string;
	username: "";
	action: "view";
	showtype: 0;
	content: "";
	url: "";
	lowurl: "";
	forwardflag: 0;
	dataurl: string; // 直接播放的 URL
	lowdataurl: "";
	contentattr: 0;

	appattach: {
		attachid: string;
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbheight: number;
		cdnthumbwidth: number;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: 1;
		fileext: "";
		islargefilemsg: 0;
	};

	songalbumurl: string; // 专辑图片 url
	songlyric: string; // 歌词，lrc 格式
	musicShareItem: {
		mvSingerName: string;
		mvAlbumName: string;
		mvIssueDate: number;
		mvIdentification: string; // e.g.  "{"songId":"1855080368"}"
		musicDuration: string; // 歌曲长度，单位毫秒
	};
}

export interface StoreProductOpenMessageEntity {
	type: OpenMessageTypeEnum.STORE_PRODUCT;

	title: string;
	url: string;
	appattach: {
		cdnthumbaeskey: "";
		aeskey: "";
	};
	finderLiveProductShare: {
		finderLiveID: 0;
		liveStatus: 1;
		appId: string;
		pagePath: string;
		productId: number;
		coverUrl: string;
		productTitle: string;
		marketPrice: number; // e.g. 8800 = ¥88.00
		sellingPrice: number; // e.g. 3000 = ¥30.00
		platformHeadImg: string;
		platformName: string;
		ecSource: string;
		platformIconURL: string;
		lastGMsgID: string;
		discountWording: string;
		showBoxItemStringList: {
			showBoxItemString: string;
		};
		isWxShop: 1;
	};
	"@_appid": "";
	"@_sdkver": "0";
}

export interface AnnouncementOpenMessageEntity {
	type: OpenMessageTypeEnum.ANNOUNCEMENT;
	url: string;
	announcement: string; // xml
	textannouncement: string;
	xmlpuretext: number;
}

export interface TingOpenMessageEntity {
	type: OpenMessageTypeEnum.TING;
	title: string;
	des: string;

	url: string;
	lowurl: string;
	dataurl?: string;
	lowdataurl?: string;
	songalbumurl: string;
	appattach: {
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbwidth: number;
		cdnthumbheight: number;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: number;
		filekey: string;
		uploadstatus: number;
	};
	md5: string;
	musicShareItem?: {
		mid: string;
		mvSingerName: string;
	};
	tingListenItem: {
		listenId: string;
		type: number;
		listenItem: string;
	};
	"@_appid": string;
	"@_sdkver": string;
}

export interface GameOpenMessageEntity {
	type: OpenMessageTypeEnum.GAME;
	title: string;
	des: string;
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
	gameshare: {
		liteappext: {
			liteappbizdata: string;
			priority: 1;
		};
		appbrandext: {
			litegameinfo: string;
			priority: -1;
		};
		gameshareid: string;
		sharedata: string;
		isvideo: 0;
		duration: 0;
		isexposed: 0;
		readtext: string;
	};
	liteapp: {
		id: string;
		path: string;
		query: string;
	};
}

export interface StoreOpenMessageEntity {
	type: OpenMessageTypeEnum.STORE;
	title: string;
	url: string;
	appattach: {
		cdnthumbaeskey: "";
		aeskey: "";
	};
	finderShopWindowShare: {
		finderUsername: string;
		query: string;
		liteAppId: string;
		liteAppPath: string;
		liteAppQuery: string;
		avatar: string;
		nickname: string;
		reputationInfo: string;
		saleWording: string;
		productImageURLList: {
			productImageURL: string;
		};
		profileTypeWording: string;
		isWxShop: 1;
		platformIconUrl: string;
		platformIconUrlDarkmode: string;
	};
	"@_appid": "";
	"@_sdkver": "0";
}

export interface RingtoneOpenMessageEntity {
	type: OpenMessageTypeEnum.RINGTONE;
	title: string;
	des: string;
}

export interface ScanResultOpenMessageEntity {
	type: OpenMessageTypeEnum.SCAN_RESULT;
	title: string;
	scanhistory: {
		url: string;
		time: string; // e.g.  "2024-08-04 18:49"
		scene: number; // e.g. 1
		type: string | "QR_CODE" | "CODE_128";
		version: number;
		isfromalbum: number;
		network: number;
		isfromcombinetab: number;
	};
}

export interface TransferOpenMessageEntity {
	type: OpenMessageTypeEnum.TRANSFER;
	title: string;
	des: string;

	wcpayinfo: {
		/**
		 * paysubtype
		 * 1: 不清楚1的意义，在数据迁移后看到了 1 的类型，微信客户端里面好像还能像没点击过一样能点击
		 * 3: 发
		 * 8: 收
		 * 4: 对方退回给你
		 * 9: 被对方退回
		 * 10: 过期退回给自己了
		 */
		paysubtype: number;
		feedesc: string; // eg. "¥23.00"
		transcationid: number;
		transferid: number;
		invalidtime: number;
		effectivedate: number;
		begintransfertime: number;
		templateid: number;
		url: string;
		nativeurl: string;
		iconurl: string;
		locallogoicon: string;
		localbubbleicon: string;
		receivertitle: string;
		sendertitle: string;
		hinttext: string;
		scenetext: string;
		sceneid: number;
		exclusive_recv_username: string;
		receiver_username: string;
		payer_username: string;
		bubble_click_flag: number;
		redenvelopetype: number;
		redenvelopereceiveamount: number;
		detailshowsourcemd5: string;
		recshowsourcemd5: string;
		receiverc2cshowsourcemd5: string;
		senderc2cshowsourcemd5: string;
		senderc2cshowsourceurl: string;
		receiverc2cshowsourceurl: string;
		recshowsourceurl: string;
		detailshowsourceurl: string;
		subtype: number;
		corpname: string;
		expressionurl: string;
		expressiontype: number;
		senderdes: string;
		receiverdes: string;
		total_fee: string;
		fee_type: string;
		innertype: number;
		bubbletype: number;
		receivestatus: number;
		paymsgid: string;
		pay_memo: string;
		has_transfer_address: number;
		imageid: string;
		imageaeskey: string;
		imagelength: number;
		newaa: {
			billno: string;
			newaatype: number;
			launchertitle: string;
			receivertitle: string;
			receiverlist: string;
			payertitle: string;
			payerlist: string;
			notinertitle: string;
			launcherusername: string;
		};
	};
}

export interface RedEnvelopeOpenMessageEntity {
	type: OpenMessageTypeEnum.RED_ENVELOPE;
	title: string;
	des: string;
	url: string;
	thumburl: string;
	wcpayinfo: {
		templateid: string;
		url: string;
		iconurl: string;
		receivertitle: string;
		sendertitle: string;
		scenetext: string; // 好像也有可能是数组
		senderdes: string; // eg. 查看红包
		receiverdes: string; // eg. 领取红包
		nativeurl: `wxpay://${string}`;
		sceneid: number;
		innertype: number;
		paymsgid: number;
		locallogoicon: string;
		invalidtime: number;
		broaden: "";

		exclusive_recv_username?: string; // 群里发红包指定接收人
		senderc2cshowsourceurl?: string; // 红包封面裁切
		receiverc2cshowsourceurl?: string; // 红包封面裁切
		recshowsourceurl?: string; // 红包封面全尺寸加上红包模板
		detailshowsourceurl?: string; // 红包封面全尺寸
		corpname?: string; // 红包封面的作者是哪个品牌

		newaa?: {
			billno: string;
			newaatype: number; // eg. 2
			receiverlist: string; // eg. "wxid,number,number,number"
			payerlist: string;
			customize_payerlist: string;
		};
	};
}
