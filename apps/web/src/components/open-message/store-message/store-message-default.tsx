import Image from "@/components/image.tsx";
import { cn } from "@/lib/utils.ts";
import type { StoreMessageProps } from "./types";

export function StoreMessageDefault({
	message,
	...props
}: StoreMessageProps) {
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
