import { RedEnvelopeIcon } from "@/components/icon.tsx";
import { cn } from "@/lib/utils";
import { OpenMessageRedEnvelopeCoverInfoSchema } from "@/schema/open-message-red-envelope-cover-info_pb.ts";
import { fromBinary } from "@bufbuild/protobuf";
import type { RedEnvelopeMessageProps } from "./types";

export function RedEnvelopeMessageDefault({
	accountId,
	message,
	...props
}: RedEnvelopeMessageProps) {
	const userRole: "SENDER" | "RECEIVER" =
		accountId === message.from.user_id ? "SENDER" : "RECEIVER";

	const hasRedEnvelopeCover =
		message.message_entity.msg.appmsg.wcpayinfo.receiverc2cshowsourceurl;

	const coverInfo = message.message_entity.msg.appmsg.wcpayinfo.coverinfo
		? fromBinary(
				OpenMessageRedEnvelopeCoverInfoSchema,
				Uint8Array.from(
					atob(message.message_entity.msg.appmsg.wcpayinfo.coverinfo),
					(c) => c.charCodeAt(0),
				),
				{ readUnknownFields: false },
			)
		: undefined;

	const hasCoverDecoration = !!(
		coverInfo &&
		coverInfo.bubbleDecorationSenderImageUrl &&
		coverInfo.bubbleDecorationReceiverImageUrl
	);

	if (hasRedEnvelopeCover) {
		return (
			<div
				className="w-64"
				data-red-envelope-decoration={hasCoverDecoration}
				{...props}
			>
				<div className={cn(hasCoverDecoration && "pt-[8.33333333%]")}>
					{/* 60/720 */}
					<div className="bg-white rounded-2xl border border-neutral-200">
						<div className="relative">
							<img
								src={
									userRole === "SENDER"
										? message.message_entity.msg.appmsg.wcpayinfo
												.senderc2cshowsourceurl
										: message.message_entity.msg.appmsg.wcpayinfo
												.receiverc2cshowsourceurl
								}
								alt={"红包封面"}
								className={"aspect-[720/264] rounded-2xl "}
							/>
							{hasCoverDecoration && (
								<img
									src={
										userRole === "SENDER"
											? coverInfo.bubbleDecorationSenderImageUrl
											: coverInfo.bubbleDecorationReceiverImageUrl
									}
									alt={"红包挂件"}
									className={
										"absolute w-480/720 aspect-[480/384] end-12/720 -inset-y-60/264 "
									}
								/>
							)}
						</div>

						<div className={"py-2 pl-2 pr-3 flex gap-1"}>
							<div className={"size-6 [&_svg]:size-full"}>
								<RedEnvelopeIcon />
							</div>
							<div>
								<h4 className={"font-medium"}>
									{userRole === "SENDER"
										? message.message_entity.msg.appmsg.wcpayinfo.sendertitle
										: message.message_entity.msg.appmsg.wcpayinfo.receivertitle}
								</h4>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<div
				className="max-w-[20em] w-fit py-4 pl-4 pr-6 flex gap-4 items-center bg-white rounded-2xl border border-neutral-200"
				{...props}
			>
				<div className={"shrink-0 size-10"}>
					<RedEnvelopeIcon className={"size-12  relative -left-1 -top-1"} />
				</div>
				<div>
					<h4 className={"font-medium"}>
						{userRole === "SENDER"
							? message.message_entity.msg.appmsg.wcpayinfo.sendertitle
							: message.message_entity.msg.appmsg.wcpayinfo.receivertitle}
					</h4>
				</div>
			</div>
		);
	}
}
