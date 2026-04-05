import Image from "@/components/image.tsx";
import type { WeComContactMessageProps } from "./types.ts";

export function WeComContactMessageDefault({
	message,
	...props
}: WeComContactMessageProps) {
	return (
		<div className="max-w-80 w-fit  rounded-lg bg-white" {...props}>
			<div className={"flex items-center p-2.5 pr-4"}>
				<Image
					src={message.message_entity.msg["@_bigheadimgurl"]}
					alt=""
					className={"shrink-0 size-12 rounded-md"}
				/>
				<div className="ml-4 flex flex-col space-y-0.5">
					<h4 className="font-medium">
						{message.message_entity.msg["@_nickname"]}
					</h4>
					<p className={"text-sm line-clamp-1 text-orange-400"}>
						@{message.message_entity.msg["@_openimdesc"]}
					</p>
				</div>
			</div>

			<div
				className={
					"px-3 py-1.5 text-sm leading-normal text-neutral-500 border-t border-neutral-200"
				}
			>
				企业微信名片
			</div>
		</div>
	);
}
