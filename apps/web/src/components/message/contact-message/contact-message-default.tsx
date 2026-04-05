import Image from "@/components/image.tsx";
import {
	Card,
	CardContent,
	CardFooter,
	CardTitle,
} from "@/components/ui/card.tsx";
import type { ContactMessageProps } from "./types.ts";

export function ContactMessageDefault({
	message,
	...props
}: ContactMessageProps) {
	if (message.message_entity.msg["@_certflag"] === "0") {
		return (
			<ContactMessagePersonalAccountDefault message={message} {...props} />
		);
	} else {
		return (
			<ContactMessageOfficialAccountDefault message={message} {...props} />
		);
	}
}

function ContactMessagePersonalAccountDefault({
	message,
	...props
}: ContactMessageProps) {
	return (
		<div
			className="w-48 flex flex-col bg-white rounded-xl overflow-hidden"
			{...props}
		>
			{message.message_entity.msg["@_bigheadimgurl"] ? (
				<Image
					src={message.message_entity.msg["@_bigheadimgurl"]}
					alt=""
					className={"shrink-0 w-full rounded-lg"}
				/>
			) : (
				<div
					className={"shrink-0 w-full pb-[100%] rounded-lg bg-neutral-300"}
				/>
			)}

			<h4 className="py-2.5 px-3 font-medium">
				{message.message_entity.msg["@_nickname"]}
			</h4>
		</div>
	);
}

function ContactMessageOfficialAccountDefault({
	message,
	...props
}: ContactMessageProps) {
	return (
		<Card className="max-w-[20em] w-fit" {...props}>
			<CardContent className={"flex items-center p-2.5 pr-4"}>
				<Image
					src={
						message.message_entity.msg["@_bigheadimgurl"] ??
						message.message_entity.msg["@_brandIconUrl"]
					}
					alt={message.message_entity.msg["@_nickname"]}
					className={"shrink-0 size-12 rounded-full"}
				/>
				<div className="ml-4 flex flex-col space-y-0.5">
					<CardTitle className="line-clamp-1">
						{message.message_entity.msg["@_nickname"]}
					</CardTitle>
					<p className={"text-sm line-clamp-1 text-muted-foreground"}>
						{message.message_entity.msg["@_certinfo"]}
					</p>
				</div>
			</CardContent>
			<CardFooter>公众号名片</CardFooter>
		</Card>
	);
}
