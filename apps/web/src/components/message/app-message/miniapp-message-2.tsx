import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MiniappMessage, {
	type MiniappMessageEntity,
} from "@/components/message/app-message/miniapp-message.tsx";
import type { AppMessageTypeEnum, AppMessageType } from "@/schema";

export interface MiniappMessage2Entity {
	type: AppMessageTypeEnum.MINIAPP_2;
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

type MiniappMessage2Props = AppMessageProps<MiniappMessage2Entity>;

export default function MiniappMessage2({
	message,
	...props
}: MiniappMessage2Props) {
	return (
		<MiniappMessage
			message={message as unknown as AppMessageType<MiniappMessageEntity>}
			{...props}
		/>
	);
}
