import { RedEnvelopeIcon } from "@/components/icon.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import { type AppMessageTypeEnum, MessageDirection } from "@/lib/schema.ts";

export interface RedEnvelopeMessageEntity {
	type: AppMessageTypeEnum.RED_ENVELOPE;
	title: string;
	des: string;
	url: string;
	thumburl: string;
	wcpayinfo: {
		templateid: string;
		url: string;
		iconurl: string;
		receivertitle: string;
		sendertitle: string;
		scenetext: string; // 好像也有可能是数组
		senderdes: string; // eg. 查看红包
		receiverdes: string; // eg. 领取红包
		nativeurl: `wxpay://${string}`;
		sceneid: number;
		innertype: number;
		paymsgid: number;
		locallogoicon: string;
		invalidtime: number;
		broaden: "";

		exclusive_recv_username?: string; // 群里发红包指定接收人
		senderc2cshowsourceurl?: string; // 红包封面裁切
		receiverc2cshowsourceurl?: string; // 红包封面裁切
		recshowsourceurl?: string; // 红包封面全尺寸加上红包模板
		detailshowsourceurl?: string; // 红包封面全尺寸
		corpname?: string; // 红包封面的作者是哪个品牌

		newaa?: {
			billno: string;
			newaatype: number; // eg. 2
			receiverlist: string; // eg. "wxid,number,number,number"
			payerlist: string;
			customize_payerlist: string;
		};
	};
}

type RedEnvelopeMessageProps = AppMessageProps<RedEnvelopeMessageEntity>;

export default function RedEnvelopeMessage({
	message,
	variant = "default",
	...props
}: RedEnvelopeMessageProps) {
	const isAA = !!message.message_entity.msg.appmsg.wcpayinfo?.newaa?.newaatype;
	const hasRedEnvelopeCover =
		!isAA &&
		message.message_entity.msg.appmsg.wcpayinfo.receiverc2cshowsourceurl;

	if (isAA) {
		if (variant === "default")
			return (
				<div
					className="max-w-[20em] w-fit py-4 pl-4 pr-6 flex gap-4 items-center bg-white rounded-2xl border border-neutral-200"
					{...props}
				>
					<div className={"shrink-0 size-10"}>
						<svg
							width="40"
							height="40"
							viewBox="0 0 40 40"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className={"size-12  relative -left-1 -top-1"}
						>
							<rect width="40" height="40" fill="white" />
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M36 20C36 28.8366 28.8366 36 20 36C11.1634 36 4 28.8366 4 20C4 11.1634 11.1634 4 20 4C28.8366 4 36 11.1634 36 20ZM25.8432 20.2239C25.1562 18.592 22.8438 18.592 22.1568 20.2239L22.1567 20.2239L19.0784 27.535C18.864 28.044 19.1029 28.6303 19.6119 28.8447C20.1209 29.059 20.7073 28.8201 20.9216 28.3111L21.5061 26.923H26.4939L27.0784 28.3111C27.2927 28.8201 27.8791 29.059 28.3881 28.8447C28.8971 28.6303 29.136 28.044 28.9216 27.535L25.8433 20.2239L25.8432 20.2239ZM25.6518 24.923L24 21.0001L22.3482 24.923H25.6518ZM14.1568 12.2239C14.8438 10.592 17.1562 10.592 17.8432 12.2239L17.8433 12.2239L20.9216 19.535C21.136 20.044 20.8971 20.6303 20.3881 20.8447C19.8791 21.059 19.2927 20.8201 19.0784 20.3111L18.4939 18.923H13.5061L12.9216 20.3111C12.7073 20.8201 12.1209 21.059 11.6119 20.8447C11.1029 20.6303 10.864 20.044 11.0784 19.535L14.1567 12.2239L14.1568 12.2239ZM16 13.0001L17.6518 16.923H14.3482L16 13.0001Z"
								fill="#1EE23F"
							/>
						</svg>
					</div>
					<div>
						<h4 className={"font-medium"}>
							{message.direction === MessageDirection.outgoing
								? message.message_entity.msg.appmsg.wcpayinfo.sendertitle
								: message.message_entity.msg.appmsg.wcpayinfo.receivertitle}
						</h4>
						<p className={"text-sm text-neutral-600"}>
							{message.direction === MessageDirection.outgoing
								? message.message_entity.msg.appmsg.wcpayinfo.senderdes
								: message.message_entity.msg.appmsg.wcpayinfo.receiverdes}
						</p>
					</div>
				</div>
			);

		return (
			<MessageInlineWrapper message={message} {...props}>
				[AA 收款]{" "}
				{message.direction === MessageDirection.outgoing
					? message.message_entity.msg.appmsg.wcpayinfo.sendertitle
					: message.message_entity.msg.appmsg.wcpayinfo.receivertitle}
			</MessageInlineWrapper>
		);
	}

	if (variant === "default") {
		if (hasRedEnvelopeCover) {
			return (
				<div
					className="w-64 bg-white overflow-hidden rounded-2xl border border-neutral-200"
					{...props}
				>
					<img
						src={
							message.message_entity.msg.appmsg.wcpayinfo
								.receiverc2cshowsourceurl
						}
						alt={"红包封面"}
						className={"rounded-2xl"}
					/>
					<div className={"py-2 pl-2 pr-3 flex gap-1"}>
						<div className={"size-6 [&_svg]:size-full"}>
							<RedEnvelopeIcon />
						</div>
						<div>
							<h4 className={"font-medium"}>
								{message.message_entity.msg.appmsg.wcpayinfo.sendertitle}
							</h4>
						</div>
					</div>
				</div>
			);
		}
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
						{message.message_entity.msg.appmsg.wcpayinfo.sendertitle}
					</h4>
				</div>
			</div>
		);
	}

	return (
		<MessageInlineWrapper message={message} {...props}>
			[红包] {message.message_entity.msg.appmsg.wcpayinfo.sendertitle}
		</MessageInlineWrapper>
	);
}
