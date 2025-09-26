import LocalImage from "@/components/local-image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import { cn } from "@/lib/utils.ts";
import type { AppMessageTypeEnum } from "@/schema";

export interface GameMessageEntity {
	type: AppMessageTypeEnum.GAME;
	title: string;
	des: string;
	appattach: {
		attachid: string;
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbheight: number;
		cdnthumbwidth: number;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: number;
		fileext: string;
		islargefilemsg: number;
	};
	gameshare: {
		liteappext: {
			liteappbizdata: string;
			priority: 1;
		};
		appbrandext: {
			litegameinfo: string;
			priority: -1;
		};
		gameshareid: string;
		sharedata: string;
		isvideo: 0;
		duration: 0;
		isexposed: 0;
		readtext: string;
	};
	liteapp: {
		id: string;
		path: string;
		query: string;
	};
}

type GameMessageProps = AppMessageProps<GameMessageEntity>;

export default function GameMessage({
	message,
	variant = "default",
	...props
}: GameMessageProps) {
	const chat = message.chat;
	if (variant === "default") {
		return <GameMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <GameMessageAbstract message={message} {...props} />;
	}
}

function GameMessageDefault({
	message,
	...props
}: Omit<GameMessageProps, "variant">) {
	const { chat } = message;
	return (
		<div
			className={cn("relative max-w-[20em] flex flex-col rounded-lg bg-white")}
			{...props}
		>
			<div className="p-3">
				<h4 className="font-medium text-pretty line-clamp-3">
					{message.message_entity.msg.appmsg.title}
				</h4>
				<div className={"mt-1 text-pretty line-clamp-5 text-neutral-500"}>
					{message.message_entity.msg.appmsg.appattach.cdnthumbmd5 && (
						<LocalImage
							chat={chat!}
							message={message}
							domain="opendata"
							className={"float-end ms-2 h-12 w-auto rounded"}
							alt={""}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

function GameMessageAbstract({
	message,
	...props
}: Omit<GameMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[游戏] {message.message_entity.msg.appmsg.title}
		</MessageInlineWrapper>
	);
}
