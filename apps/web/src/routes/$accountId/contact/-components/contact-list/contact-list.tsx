import { ContactIconFill } from "@/components/icon";
import {
	MiniOutlet,
	useMiniRoute,
	useMiniRouter,
} from "@/components/mini-router";
import { MiniRouteFirstPageContentClassName } from "@/components/mini-router/utils";
import { ScrollAreaViewport, ScrollBar } from "@/components/ui/scroll-area";
import { AccountContactListSuspenseQueryOptions } from "@/lib/fetchers/contact";
import { cn } from "@/lib/utils";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import ContactAlphabetList, {
	AlphabetNavigator,
} from "./contact-alphabet-list";
import ContactItem from "./contact-item";
import useContactAlphabetList from "./use-contact-alphabet-list";
import useContactList, { ContactListContctGroupItem } from "./use-contact-list";
import imageGroupChats from "/public/images/avatar/group_chats.png";

export interface ContactListMiniRouteState {
	name: "root";
	data: {
		accountId: string;
	};
}

export default function ContactList() {
	const {
		data: { accountId },
	} = useMiniRoute() as ContactListMiniRouteState;

	const { states: miniRouterStates } = useMiniRouter();
	const thisMiniRouteState = useMiniRoute();
	const thisMiniRoutePosition = miniRouterStates.findIndex((state) =>
		Object.is(state, thisMiniRouteState),
	);
	const isThisMiniRouteOnTop =
		thisMiniRoutePosition === miniRouterStates.length - 1;

	const { data: contactList } = useSuspenseQuery(
		AccountContactListSuspenseQueryOptions(accountId),
	);

	const [scrollTarget, setScrollTarget] = useState<HTMLDivElement>();

	const contactListWithGroup = useContactList(contactList);

	const personalAccountAlphabetList = useContactAlphabetList(
		contactListWithGroup.personalAccount,
	);

	return (
		<div className="absolute inset-0">
			<section
				data-alphabet="root"
				className={cn("absolute inset-0", MiniRouteFirstPageContentClassName)}
				aria-hidden={!isThisMiniRouteOnTop}
				style={{
					pointerEvents: isThisMiniRouteOnTop ? "auto" : "none",
				}}
			>
				<ScrollAreaPrimitive.Root className="relative w-full h-full">
					<ScrollAreaViewport
						ref={(node) => {
							if (node) {
								setScrollTarget(node);
							}
						}}
					>
						<header className="sticky z-30 top-0 h-16 px-5 flex items-center bg-background/80 border-b border-muted backdrop-blur-xl">
							<div className="size-11 flex items-center justify-center text-[#FF970A] bg-background clothoid-corner-[18.18%] shrink-0">
								<ContactIconFill className="size-8" />
							</div>
							<div className="ms-3 font-semibold">
								<span className="font-medium">联系人</span>
							</div>
						</header>

						{/* 
							新朋友
							仅聊天的联系人	
							群聊
							标签
							公众号
							服务号
							企业微信联系人
						*/}

						<ContactItem
							accountId={accountId}
							contactItem={
								{
									type: "contactGroup",
									id: "group_chats",
									title: "群聊",
									photo: imageGroupChats,
									value: contactListWithGroup.groupChat,
								} satisfies ContactListContctGroupItem
							}
						/>

						<ContactAlphabetList
							accountId={accountId}
							contactAlphabetList={personalAccountAlphabetList}
						/>
					</ScrollAreaViewport>
					<ScrollBar className="z-30 !top-16" />

					<ScrollAreaPrimitive.Corner />
				</ScrollAreaPrimitive.Root>

				{scrollTarget && (
					<AlphabetNavigator
						scrollTarget={scrollTarget}
						className="z-20 absolute my-auto top-0 bottom-0 end-1.5"
					/>
				)}
			</section>

			<MiniOutlet />
		</div>
	);
}
