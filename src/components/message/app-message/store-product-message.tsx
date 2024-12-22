import Image from "@/components/image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";
import { cn } from "@/lib/utils";

export interface StoreProductMessageEntity {
  type: AppMessageType.STORE_PRODUCT;

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

type StoreProductMessageProps = AppMessageProps<StoreProductMessageEntity>;

export default function StoreProductMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: StoreProductMessageProps) {
  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message as unknown as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className={cn("relative w-52 bg-white rounded-lg overflow-hidden")}
          {...props}
        >
          <Image
            src={
              message.message_entity.msg.appmsg.finderLiveProductShare.coverUrl
            }
          />
          <div className={"p-2.5"}>
            <h4 className="line-clamp-3 leading-normal font-medium text-pretty">
              {
                message.message_entity.msg.appmsg.finderLiveProductShare
                  .productTitle
              }
            </h4>

            <h5 className={"-mb-[0.25em] text-orange-600"}>
              <span className={"text-lg font-semibold"}>
                ¥
                {message.message_entity.msg.appmsg.finderLiveProductShare
                  .marketPrice / 100}
              </span>

              <small className={"ml-1 text-xs"}>
                {
                  message.message_entity.msg.appmsg.finderLiveProductShare
                    .discountWording
                }
              </small>
            </h5>
          </div>

          <div className="px-3 py-1.5 text-sm leading-normal text-neutral-500 border-t border-neutral-200">
            <div
              className={
                "relative inline-block align-top mt-[0.275em] size-[1em] me-1.5 [&_img]:inline [&_img]:absolute [&_img]:inset-0 [&_img]:m-auto [&_img]:size-full "
              }
            >
              <Image
                src={
                  message.message_entity.msg.appmsg.finderLiveProductShare
                    .platformHeadImg
                }
                className={""}
              />
            </div>
            {
              message.message_entity.msg.appmsg.finderLiveProductShare
                .platformName
            }

            <div className={"float-end mt-1 ms-2 size-3.5 [&_img]:size-full"}>
              <Image
                src={
                  message.message_entity.msg.appmsg.finderLiveProductShare
                    .platformIconURL
                }
              />
            </div>
          </div>
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [微信小店]{" "}
      {message.message_entity.msg.appmsg.finderLiveProductShare.productTitle}
    </p>
  );
}
