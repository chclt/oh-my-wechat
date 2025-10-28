import type { AppMessageProps } from "@/components/message/app-message.tsx";
import AttachMessage, {
	type AttachMessageEntity,
} from "@/components/message/app-message/attach-message.tsx";
import type { AppMessageType, AppMessageTypeEnum } from "@/schema";

export interface AttachMessage2Entity {
	type: AppMessageTypeEnum.ATTACH_2;
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

type AttachMessage2Props = AppMessageProps<AttachMessage2Entity>;

export default function Attach2Message({
	message,
	...props
}: AttachMessage2Props) {
	return (
		<AttachMessage
			message={message as unknown as AppMessageType<AttachMessageEntity>}
			{...props}
		/>
	);
}
