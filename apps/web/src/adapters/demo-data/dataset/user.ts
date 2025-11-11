import { ContactType, UserType } from "@/schema";

export const user_0: UserType = {
	id: "wxid_00000000000000",
	user_id: "wxid_00000000000000",
	username: "我",
	bio: "这个人很懒，什么都没有留下。",
	photo: {
		origin: "string",
		thumb: "string",
	},
	is_openim: false,
};

export const user_1: UserType = {
	id: "wxid_00000000000001",
	user_id: "wxid_000000000000001",
	username: "阿远",
	bio: "保持热爱，奔赴山海",
	photo: {
		origin: "string",
		thumb: "string",
	},
	is_openim: false,
};

export const user_1_contact: ContactType = {
	id: "wxid_00000000000001",
	username: "阿远",
	usernamePinyin: "AYUAN",

	remark: "陈思远",
	remarkPinyin: "CHENSIYUAN",
	remarkPinyinInits: "CSY",

	photo: {
		origin: "string",
		thumb: "string",
	},
	is_openim: false,
};

export const UserList = [user_0, user_1];

export const ContactList = [user_1_contact];
