import { ChatType, UserType } from "../common.ts";

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

export type TextMessageEntity = string;

export type TextMessageType = BasicMessageType<
  MessageTypeEnum.TEXT,
  TextMessageEntity
>;

export interface ImageMessageEntity {
  msg: {
    img: {
      "@_hdlength": string;
      "@_length": string;
      "@_aeskey": string;
      "@_encryver": "0" | "1";
      "@_md5": string;
      "@_filekey": `${string}_${string}_${string}`;
      "@_uploadcontinuecount": string;
      "@_imgsourceurl": string;
      "@_hevc_mid_size": string;

      "@_cdnbigimgurl": "";

      "@_cdnmidimgurl": string;
      "@_cdnmidheight": string;
      "@_cdnmidwidth": string;

      "@_cdnhdheight": string;
      "@_cdnhdwidth": string;

      "@_cdnthumburl": string;
      "@_cdnthumblength": string;
      "@_cdnthumbwidth": string;
      "@_cdnthumbheight": string;
      "@_cdnthumbaeskey": string;
    };
    appinfo: {
      appid: "";
      appname: "";
      version: 0;
      isforceupdate: 1;
      mediatagname: "";
      messageext: "";
      messageaction: "";
    };
    MMAsset: {
      m_assetUrlForSystem: string;
      m_isNeedOriginImage: 0 | 1;
      m_isFailedFromIcloud: 0 | 1;
      m_isLoadingFromIcloud: 0 | 1;
    };
  };
}

export type ImageMessageType = BasicMessageType<
  MessageTypeEnum.IMAGE,
  ImageMessageEntity
>;

export interface VoiceMessageEntity {
  msg: {
    voicemsg: {
      "@_endflag": "0" | "1";
      "@_cancelflag": "0" | "1";
      "@_forwardflag": "0" | "1";
      "@_voiceformat": string;
      "@_voicelength": string;
      "@_length": string;
      "@_bufid": string;
      "@_aeskey": string;
      "@_voiceurl": string;
      "@_voicemd5": string;
      "@_clientmsgid": string;
      "@_fromusername": string;
    };
  };
}

export type VoiceMessageType = BasicMessageType<
  MessageTypeEnum.VOICE,
  VoiceMessageEntity
>;

export interface MailMessageEntity {
  msg: {
    pushmail: {
      content: {
        subject: string; // 邮件主题
        attach: boolean;
        sender: string; // 发件人
        digest: string; // e.g. "点击查看全文"
        date: string; // e.g. "2021-03-10 17:17:43"
        fromlist: {
          item: {
            name: string; // 发件人名字
            addr: string; // 发件人邮箱
          };
          "@_count": string; // e.g. "1"
        };
        tolist: {
          item: {
            name: string; // 收件人名字
            addr: string; // 收件人邮箱
          };
          "@_count": string; // e.g. "1"
        };
        cclist: {
          "@_count": string; // e.g. "0"
        };
      };
      mailid: string;
      waplink: string; // 打开邮箱的链接
    };
  };
}

export type MailMessageType = BasicMessageType<
  MessageTypeEnum.MAIL,
  MailMessageEntity
>;

export interface ContactMessageEntity {
  msg: {
    "@_certflag": string; // 个人名片应该是 "0"
    "@_certinfo": string; // 企业认证信息

    "@_brandIconUrl": string;
    "@_brandHomeUrl": string; // JSON 公众号相关配置
    "@_brandSubscriptConfigUrl": string; // JSON 公众号相关配置
    "@_brandFlags": "0" | "1";

    "@_regionCode": string;

    "@_biznamecardinfo": string; // unknown

    "@_bigheadimgurl": string;
    "@_smallheadimgurl": string;
    "@_username": string;
    "@_nickname": string;
    "@_fullpy": string;
    "@_shortpy": string;
    "@_alias": string;
    "@_imagestatus": string; // unknown
    "@_scene": string;
    "@_province": string;
    "@_city": string;
    "@_sign": string; // 个性签名
    "@_sex": "0" | "1"; // TODO
  };
}

export type ContactMessageType = BasicMessageType<
  MessageTypeEnum.CONTACT,
  ContactMessageEntity
>;

export interface VideoMessageEntity {
  msg: {
    videomsg: {
      "@_length": string;
      "@_playlength": string;
      "@_offset": string;
      "@_rawoffset": string;
      "@_fromusername": string;
      "@_status": string;
      "@_cameratype": string;
      "@_source": string;
      "@_aeskey": string;

      "@_cdnvideourl": string;

      "@_cdnthumburl": string;
      "@_cdnthumblength": string;
      "@_cdnthumbwidth": string;
      "@_cdnthumbheight": string;
      "@_cdnthumbaeskey": string;

      "@_encryver": string;
      "@_fileparam": string;
      "@_md5": string;
      "@_newmd5": string;
      "@_filekey": `${string}_${string}_${string}`;
      "@_uploadcontinuecount": string;

      "@_rawlength": string;
      "@_rawmd5": string;
      "@_cdnrawvideourl": string;
      "@_cdnrawvideoaeskey": string;

      "@_overwritemsgcreatetime": string;
      "@_overwritenewmsgid": string;

      "@_videouploadtoken": string;
      "@_isplaceholder": string;
      "@_rawuploadcontinuecount": string;
    };
  };
}

export type VideoMessageType = BasicMessageType<
  MessageTypeEnum.VIDEO,
  VideoMessageEntity
>;

export interface StickerMessageEntity {
  msg: {
    emoji: {
      "@_fromusername": string;
      "@_tousername": string;
      "@_type": string;
      "@_idbuffer": string;
      "@_md5": string;
      "@_len": string;
      "@_productid": string;
      "@_androidmd5": string;
      "@_androidlen": string;

      "@_s60v3md5": string;
      "@_s60v3len": string;
      "@_s60v5md5": string;
      "@_s60v5len": string;

      "@_cdnurl": string;
      "@_designerid": string;
      "@_thumburl": string;
      "@_encrypturl": string;
      "@_aeskey": string;

      "@_externurl": string;
      "@_externmd5": string;

      "@_width": string;
      "@_height": string;

      "@_tpurl": string;
      "@_tpauthkey": string;
      "@_attachedtext": string;
      "@_attachedtextcolor": string;
      "@_lensid": string;
      "@_emojiattr": string;
      "@_linkid": string;
      "@_desc": string; // base64 编码后的 protobuf 数据，包含表情描述等等
    };

    gameext: {
      "@_type": string;
      "@_content": string;
    };
  };
}

export type StickerMessageType = BasicMessageType<
  MessageTypeEnum.STICKER,
  StickerMessageEntity
>;

export interface LocationMessageEntity {
  msg: {
    location: {
      "@_x": string; // 纬度
      "@_y": string; // 经度
      "@_scale": string; // ？缩放级别
      "@_label": string;
      "@_maptype": string;
      "@_poiname": string;
      "@_poiid": string;
      "@_buildingId": string;
      "@_floorName": string;
      "@_poiCategoryTips": string;
      "@_poiBusinessHour": string;
      "@_poiPhone": string;
      "@_poiPriceTips": string;
      "@_isFromPoiList": "true" | "false";
      "@_adcode": string;
      "@_cityname": string;
    };
  };
}

export type LocationMessageType = BasicMessageType<
  MessageTypeEnum.LOCATION,
  LocationMessageEntity
>;

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

export type OpenMessageType<
  OpenMessageEntityType = {
    type: unknown;
  },
> = BasicMessageType<
  MessageTypeEnum.APP,
  OpenMessageEntity<OpenMessageEntityType>
>;
export interface VoipMessageEntity {
  voipmsg?: {
    "@_type": "VoIPBubbleMsg" | string; // eg. VoIPBubbleMsg
    VoIPBubbleMsg: {
      msg: string; // eg. 通话时长 00:31
      room_type: number; // 0: 视频通话, 1: 语音通话
      red_dot: "true" | "false";
      roomid: string;
      roomkey: string;
      inviteid: string;
      msg_type: string; // eg. 0
      timestamp: string;
      identity: string;
      duration: string;
      inviteid64: string;
      business: string;
    };
  };
  voipinvitemsg?: {
    roomid: number;
    key: string;
    status: 2;
    invitetype: 1;
  };
  voipextinfo?: {
    recvtime: number;
  };
}

export type VoipMessageType = BasicMessageType<
  MessageTypeEnum.VOIP,
  VoipMessageEntity
>;

export interface MicroVideoMessageEntity {
  msg: {
    videomsg: {
      "@_clientmsgid": string;
      "@_playlength": string;
      "@_length": string;
      "@_type": string;
      "@_status": string;
      "@_fromusername": string;
      "@_aeskey": string;
      "@_cdnvideourl": string;
      "@_cdnthumburl": string;
      "@_cdnthumblength": string;
      "@_cdnthumbwidth": string;
      "@_cdnthumbheight": string;
      "@_cdnthumbaeskey": string;
      "@_encryver": string;
      "@_isplaceholder": string;
      "@_rawlength": string;
      "@_cdnrawvideourl": string;
      "@_cdnrawvideoaeskey": string;
    };
  };
}

export type MicroVideoMessageType = BasicMessageType<
  MessageTypeEnum.MICROVIDEO,
  MicroVideoMessageEntity
>;
export interface ChatroomVoipMessageEntity {
  msgLocalID: number;
  clientGroupID: string;
  groupID: string;
  lastMsgID: number;
  msgContent: string; // eg. "XXX has started a voice call"
}

export type ChatroomVoipMessageType = BasicMessageType<
  MessageTypeEnum.GROUP_VOIP,
  ChatroomVoipMessageEntity
>;

export interface WeComContactMessageEntity {
  msg: {
    "@_username": string;
    "@_nickname": string;
    "@_sex": string;
    "@_smallheadimgurl": string;
    "@_bigheadimgurl": string;
    "@_openimappid": string;
    "@_openimdesc": string;
    "@_openimdescicon": string;
  };
}

export type WeComContactMessageType = BasicMessageType<
  MessageTypeEnum.WECOM_CONTACT,
  WeComContactMessageEntity
>;

export type SystemMessageEntity = string;

export type SystemMessageType = BasicMessageType<
  MessageTypeEnum.SYSTEM,
  SystemMessageEntity
>;

export interface SystemExtendedMessageEntity {
  sysmsg:
    | {
        "@_type": "editrevokecontent";
        editrevokecontent: {
          text: string; // eg. "You recalled a message"
          link: {
            scene: string; // eg. "editrevokecontent"
            text: string; // eg. "Edit"
            revokecontent: string;
            referid: string;
            atuserlist: string;
            createTime: string;
          };
        };
      }
    | {
        "@_type": "sysmsgtemplate";
        sysmsgtemplate: {
          content_template: {
            plain: "";
            template: "$username$ invited $names$ to the group chat";
            link_list: {
              link: [
                {
                  memberlist: {
                    member: {
                      username: "wxid";
                      nickname: "nickname";
                    };
                  };
                  "@_name": "username";
                  "@_type": "link_profile";
                },
                {
                  memberlist: {
                    member: {
                      username: "wxid";
                      nickname: "nickname";
                    };
                  };
                  separator: ", ";
                  "@_name": "names";
                  "@_type": "link_profile";
                },
              ];
            };
            "@_type": "tmpl_type_profile";
          };
        };
      };
}

export type SystemExtendedMessageType = BasicMessageType<
  MessageTypeEnum.SYSTEM_EXTENDED,
  SystemExtendedMessageEntity
>;

// Special Message Type
export interface VerityMessageEntity {
  msg: {
    "@_fromusername": "wxid";
    "@_fromnickname": "nickname";
    "@_fullpy": string;
    "@_shortpy": string;
    "@_encryptusername": string;
    "@_content": string; // eg. 我是...
    "@_sign": string; // bio
    "@_imagestatus": "3";
    "@_scene": "17";
    "@_country": string;
    "@_province": string;
    "@_city": string;
    "@_percard": "1";
    "@_sex": "1";
    "@_alias": string; // user_id;
    "@_weibo": "";
    "@_albumflag": "0";
    "@_albumstyle": "0";
    "@_albumbgimgid": string;
    "@_snsflag": "305";
    "@_snsbgimgid": "http://.../0";
    "@_snsbgobjectid": string;
    "@_mhash": string;
    "@_mfullhash": string;
    "@_bigheadimgurl": "http://.../0";
    "@_smallheadimgurl": "http://.../132";
    "@_ticket": string; // e.g. "@v4_xxxxx@stranger"
    "@_opcode": "2";
    "@_googlecontact": "";
    "@_qrticket": "";
    "@_chatroomusername": "";
    "@_sourceusername": "wxid";
    "@_sourcenickname": "nickname";
    "@_sharecardusername": "wxid";
    "@_sharecardnickname": "nickname";
    "@_cardversion": "0";
    "@_extflag": "0";
  };
}

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
