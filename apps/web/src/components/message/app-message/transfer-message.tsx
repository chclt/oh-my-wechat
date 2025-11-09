import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import type { AppMessageTypeEnum } from "@/schema";

export interface TransferMessageEntity {
	type: AppMessageTypeEnum.TRANSFER;
	title: string;
	des: string;

	wcpayinfo: {
		/**
		 * paysubtype
		 * 1: 不清楚1的意义，在数据迁移后看到了 1 的类型，微信客户端里面好像还能像没点击过一样能点击
		 * 3: 发
		 * 8: 收
		 * 4: 对方退回给你
		 * 9: 被对方退回
		 * 10: 过期退回给自己了
		 */
		paysubtype: number;
		feedesc: string; // eg. "¥23.00"
		transcationid: number;
		transferid: number;
		invalidtime: number;
		effectivedate: number;
		begintransfertime: number;
		templateid: number;
		url: string;
		nativeurl: string;
		iconurl: string;
		locallogoicon: string;
		localbubbleicon: string;
		receivertitle: string;
		sendertitle: string;
		hinttext: string;
		scenetext: string;
		sceneid: number;
		exclusive_recv_username: string;
		receiver_username: string;
		payer_username: string;
		bubble_click_flag: number;
		redenvelopetype: number;
		redenvelopereceiveamount: number;
		detailshowsourcemd5: string;
		recshowsourcemd5: string;
		receiverc2cshowsourcemd5: string;
		senderc2cshowsourcemd5: string;
		senderc2cshowsourceurl: string;
		receiverc2cshowsourceurl: string;
		recshowsourceurl: string;
		detailshowsourceurl: string;
		subtype: number;
		corpname: string;
		expressionurl: string;
		expressiontype: number;
		senderdes: string;
		receiverdes: string;
		total_fee: string;
		fee_type: string;
		innertype: number;
		bubbletype: number;
		receivestatus: number;
		paymsgid: string;
		pay_memo: string;
		has_transfer_address: number;
		imageid: string;
		imageaeskey: string;
		imagelength: number;
		newaa: {
			billno: string;
			newaatype: number;
			launchertitle: string;
			receivertitle: string;
			receiverlist: string;
			payertitle: string;
			payerlist: string;
			notinertitle: string;
			launcherusername: string;
		};
	};
}

type TransferMessageProps = AppMessageProps<TransferMessageEntity>;

export default function TransferMessage({
	message,
	variant = "default",
	...props
}: TransferMessageProps) {
	if (variant === "default") {
		return <TransferMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <TransferMessageAbstract message={message} {...props} />;
	}
}

function TransferMessageDefault({
	message,
	...props
}: Omit<TransferMessageProps, "variant">) {
	const chat = message.chat;
	const payerId = message.message_entity.msg.appmsg.wcpayinfo.payer_username;
	const payer = chat?.members.find((member) => member.id === payerId);
	if (payer && message.from === undefined) message.from = payer;

	const receiverId =
		message.message_entity.msg.appmsg.wcpayinfo.receiver_username;
	const receiver = chat?.members.find((member) => member.id === receiverId);

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
						d="M20 36C28.8366 36 36 28.8366 36 20C36 11.1634 28.8366 4 20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36ZM16.872 13.8839C17.3602 13.3957 17.3602 12.6043 16.872 12.1161C16.3839 11.628 15.5924 11.628 15.1043 12.1161L12.3602 14.8602C11.5466 15.6738 11.5466 16.9929 12.3602 17.8065L15.1043 20.5506C15.5924 21.0387 16.3839 21.0387 16.872 20.5506C17.3602 20.0624 17.3602 19.2709 16.872 18.7828L15.6726 17.5833H26.4048C27.0951 17.5833 27.6548 17.0237 27.6548 16.3333C27.6548 15.643 27.0951 15.0833 26.4048 15.0833H15.6726L16.872 13.8839ZM24.372 20.4494C23.8838 19.9613 23.0924 19.9613 22.6042 20.4494C22.1161 20.9376 22.1161 21.7291 22.6042 22.2172L23.8037 23.4167H13.0715C12.3811 23.4167 11.8215 23.9763 11.8215 24.6667C11.8215 25.357 12.3811 25.9167 13.0715 25.9167H23.8037L22.6042 27.1161C22.1161 27.6043 22.1161 28.3957 22.6042 28.8839C23.0924 29.372 23.8838 29.372 24.372 28.8839L27.116 26.1399L27.1161 26.1398C27.9297 25.3262 27.9297 24.0071 27.1161 23.1935L27.116 23.1934L24.372 20.4494Z"
						fill="#FFCC33"
					/>
				</svg>
			</div>
			<div>
				<h4 className={"font-medium"}>
					{message.message_entity.msg.appmsg.wcpayinfo.pay_memo.length > 0 ? (
						message.message_entity.msg.appmsg.wcpayinfo.pay_memo
					) : (
						<>
							{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 1 &&
								"转账"}

							{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 3 &&
								"接收转账"}

							{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 8 &&
								"发起转账"}

							{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 4 &&
								"已退回"}

							{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 9 &&
								"被退回"}

							{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 10 &&
								"已过期"}
						</>
					)}
				</h4>
				<p className={"text-sm text-neutral-600"}>
					{message.message_entity.msg.appmsg.wcpayinfo.feedesc}
					{/*{payer && (*/}
					{/*  <span>*/}
					{/*    FROM*/}
					{/*    {payer.remark ?? payer.username}*/}
					{/*  </span>*/}
					{/*)}*/}

					{/*{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 8 &&*/}
					{/*  "发起了一笔微信转账"}*/}
					{/*{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 3 &&*/}
					{/*  "接收了微信转账"}*/}
				</p>
			</div>
		</div>
	);
}

function TransferMessageAbstract({
	message,
	...props
}: Omit<TransferMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[转账] {message.from.remark ?? message.from.username}
			{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 8 &&
				"发起转账"}
			{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 3 &&
				"接收转账"}
		</MessageInlineWrapper>
	);
}
