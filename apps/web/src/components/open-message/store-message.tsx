import Image from "@/components/image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import { cn } from "@/lib/utils.ts";
import { StoreOpenMessageEntity } from "@/schema/open-message.ts";

type StoreMessageProps = OpenMessageProps<StoreOpenMessageEntity>;

export default function StoreMessage({
	message,
	variant = "default",
	...props
}: StoreMessageProps) {
	if (variant === "default") {
		return <StoreMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <StoreMessageAbstract message={message} {...props} />;
	}
}

function StoreMessageDefault({
	message,
	...props
}: Omit<StoreMessageProps, "variant">) {
	return (
		<div
			className={cn(
				"relative w-64 flex flex-col bg-white rounded-lg overflow-hidden",
			)}
			{...props}
		>
			<div className={"p-2.5 flex items-center gap-4"}>
				<Image
					src={message.message_entity.msg.appmsg.finderShopWindowShare.avatar}
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
	);
}

function StoreMessageAbstract({
	message,
	...props
}: Omit<StoreMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[微信小店]{" "}
			{message.message_entity.msg.appmsg.finderShopWindowShare.nickname}
		</MessageInlineWrapper>
	);
}
