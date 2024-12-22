import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import User from "@/components/user.tsx";
import type { LocationMessage as LocationMessageVM } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";

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
  direction,

  showPhoto,
  showUsername,

  ...props
}: LocationMessageProps) {
  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className={
            "relative w-72 flex flex-col items-stretch bg-white rounded-2xl border border-neutral-200"
          }
          {...props}
        >
          <div
            className={"h-20 flex justify-center items-center [&_svg]:size-12"}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_353_265)">
                <path
                  d="M9.98953 20.5104C6.67008 17.191 6.67008 11.809 9.98953 8.48959V8.48959C13.309 5.17014 18.6909 5.17014 22.0103 8.48959V8.48959C25.3298 11.809 25.3298 17.191 22.0103 20.5104L17.7172 24.8036C17.4356 25.0851 17.2949 25.2259 17.1573 25.3235C16.4641 25.8153 15.5358 25.8153 14.8426 25.3235C14.705 25.2259 14.5642 25.0851 14.2827 24.8036L9.98953 20.5104Z"
                  fill="#39A9FF"
                />
              </g>
              <defs>
                <filter
                  id="filter0_d_353_265"
                  x="5.5"
                  y="6"
                  width="21"
                  height="25.6924"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feMorphology
                    radius="2"
                    operator="erode"
                    in="SourceAlpha"
                    result="effect1_dropShadow_353_265"
                  />
                  <feOffset dy="4" />
                  <feGaussianBlur stdDeviation="2" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0.369824 0 0 0 0 0.726924 0 0 0 0 1 0 0 0 0.25 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_353_265"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_353_265"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
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
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [位置] {message.message_entity.msg.location["@_poiname"]}
    </p>
  );
}
