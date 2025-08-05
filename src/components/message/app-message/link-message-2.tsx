import type { AppMessageProps } from "@/components/message/app-message.tsx";
import type {
	AppMessageTypeEnum,
	AppMessage as AppMessageType,
} from "@/lib/schema.ts";
import UrlMessage, { type UrlMessageEntity } from "./url-message";

export interface LinkMessage2Entity {
	type: AppMessageTypeEnum.LINK_2;
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

type LinkMessage2Props = AppMessageProps<LinkMessage2Entity>;

export default function LinkMessage2({ message, ...props }: LinkMessage2Props) {
	return (
		<UrlMessage
			message={message as unknown as AppMessageType<UrlMessageEntity>}
			{...props}
		/>
	);
}
