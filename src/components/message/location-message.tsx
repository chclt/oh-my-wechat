import type { MessageProp } from "@/components/message/message.tsx";
import type { LocationMessageType } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import { cva } from "class-variance-authority";
import { LocationIcon } from "../icon";
import MessageInlineWrapper from "./message-inline";

type LocationMessageProps = MessageProp<LocationMessageType>;

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

export const locationMessageVariants = cva(
	"max-w-[20em] py-3 ps-3 pe-5.5 flex items-center gap-3 bg-white rounded-2xl [&_svg]:shrink-0 text-pretty",
);

export default function LocationMessage({
	message,
	variant = "default",
	...props
}: LocationMessageProps) {
	if (variant === "default")
		return (
			<div className={cn(locationMessageVariants())} {...props}>
				<LocationIcon />
				<div>
					<h4 className={"font-medium"}>
						{message.message_entity.msg.location["@_poiname"]}
					</h4>
					<p className={"text-sm text-muted-foreground"}>
						{message.message_entity.msg.location["@_label"]}
					</p>
				</div>
			</div>
		);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[位置] {message.message_entity.msg.location["@_poiname"]}
		</MessageInlineWrapper>
	);
}
