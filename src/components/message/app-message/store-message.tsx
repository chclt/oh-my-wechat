import Image from "@/components/image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";
import { cn } from "@/lib/utils";

export interface StoreMessageEntity {
  type: AppMessageType.STORE;
  title: string;
  url: string;
  appattach: {
    cdnthumbaeskey: "";
    aeskey: "";
  };
  finderShopWindowShare: {
    finderUsername: string;
    query: string;
    liteAppId: string;
    liteAppPath: string;
    liteAppQuery: string;
    avatar: string;
    nickname: string;
    reputationInfo: string;
    saleWording: string;
    productImageURLList: {
      productImageURL: string;
    };
    profileTypeWording: string;
    isWxShop: 1;
    platformIconUrl: string;
    platformIconUrlDarkmode: string;
  };
  "@_appid": "";
  "@_sdkver": "0";
}

type StoreMessageProps = AppMessageProps<StoreMessageEntity>;

export default function StoreMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: StoreMessageProps) {
  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message as unknown as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className={cn(
            "relative w-64 flex flex-col bg-white rounded-lg overflow-hidden",
          )}
          {...props}
        >
          <div className={"p-2.5 flex items-center gap-4"}>
            <Image
              src={
                message.message_entity.msg.appmsg.finderShopWindowShare.avatar
              }
              className={"shrink-0 size-12"}
            />
            <h4 className="line-clamp-3 leading-normal font-medium text-pretty">
              {message.message_entity.msg.appmsg.finderShopWindowShare.nickname}
            </h4>
          </div>

          <div className="px-3 py-1.5 text-sm leading-normal text-neutral-500 border-t border-neutral-200">
            微信小店
            <div className={"float-end mt-1 ms-2 size-3.5 [&_img]:size-full"}>
              <Image
                src={
                  message.message_entity.msg.appmsg.finderShopWindowShare
                    .platformIconUrl
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
      {message.message_entity.msg.appmsg.finderShopWindowShare.nickname}
    </p>
  );
}
