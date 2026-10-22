// Mirrors adapter-ios-backup/src/database/contact.proto. Unknown fields are skipped.
// Keep protobuf defaults separate from the optional fields in frontend responses.

#[derive(Clone, PartialEq, prost::Message)]
pub(super) struct Remark {
    #[prost(string, optional, tag = "1")]
    pub(super) nickname: Option<String>,
    #[prost(string, tag = "2")]
    pub(super) id: String,
    #[prost(string, optional, tag = "3")]
    pub(super) remark: Option<String>,
    #[prost(string, optional, tag = "4")]
    pub(super) remark_pinyin: Option<String>,
    #[prost(string, optional, tag = "5")]
    pub(super) remark_pinyin_inits: Option<String>,
    #[prost(string, optional, tag = "6")]
    pub(super) nickname_pinyin: Option<String>,
}

#[derive(Clone, PartialEq, prost::Message)]
pub(super) struct HeadImage {
    #[prost(string, optional, tag = "2")]
    pub(super) head_image_thumb: Option<String>,
    #[prost(string, optional, tag = "3")]
    pub(super) head_image: Option<String>,
}

#[derive(Clone, PartialEq, prost::Message)]
pub(super) struct Profile {
    #[prost(int32, tag = "1")]
    pub(super) profile_flag: i32,
    #[prost(string, tag = "2")]
    pub(super) profile_country: String,
    #[prost(string, tag = "3")]
    pub(super) profile_province: String,
    #[prost(string, tag = "4")]
    pub(super) profile_city: String,
    #[prost(string, tag = "5")]
    pub(super) profile_bio: String,
}

#[derive(Clone, PartialEq, prost::Message)]
pub(super) struct Social {
    #[prost(string, tag = "9")]
    pub(super) social_background: String,
    #[prost(string, optional, tag = "11")]
    pub(super) social_phone: Option<String>,
}

#[derive(Clone, PartialEq, prost::Message)]
pub(super) struct ChatRoom {
    #[prost(string, tag = "1")]
    pub(super) chatroom_member_ids: String,
    #[prost(string, tag = "2")]
    pub(super) chatroom_owner_ids: String,
    #[prost(uint32, tag = "4")]
    pub(super) chatrooma_max_count: u32,
    #[prost(uint32, tag = "5")]
    pub(super) chatroom_version: u32,
    #[prost(string, tag = "6")]
    pub(super) chatroom_member: String,
}

#[derive(Clone, PartialEq, prost::Message)]
pub(super) struct OpenIM {
    #[prost(string, tag = "1")]
    pub(super) open_im_contact_info: String,
    #[prost(string, tag = "2")]
    pub(super) open_im_contact_id: String,
}
