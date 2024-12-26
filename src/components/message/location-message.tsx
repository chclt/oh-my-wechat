import type { MessageProp } from "@/components/message/message.tsx";
import type { LocationMessage as LocationMessageVM } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import { LocationIcon } from "../icon";
import MessageInlineWrapper from "./message-inline";

type LocationMessageProps = MessageProp<LocationMessageVM>;

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

export default function LocationMessage({
  message,
  variant = "default",
  ...props
}: LocationMessageProps) {
  if (variant === "default")
    return (
      <div
        className={
          "relative w-72 flex flex-col items-stretch bg-white rounded-2xl border border-neutral-200"
        }
        {...props}
      >
        <div
          className={"h-20 flex justify-center items-center [&_svg]:size-12"}
        >
          <LocationIcon />
        </div>
        <div
          className={cn(
            "relative py-2.5 px-3 flex flex-col",
            "after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:border-t after:border-neutral-200",
          )}
        >
          <h4 className={"font-medium"}>
            {message.message_entity.msg.location["@_poiname"]}
          </h4>
          <p className={"text-sm"}>
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
