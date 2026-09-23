import imageGreetingMessages from "/images/avatar/greeting_messages.png";
import imageGroupChats from "/images/avatar/group_chats.png";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { Redirect, Route as LocalRoute, useLocation } from "wouter";
import { ContactIconFill } from "@/components/icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WouterFirstPageContentClassName } from "@/components/wouter/page";
import { AccountContactListSuspenseQueryOptions } from "@/lib/fetchers/contact";
import { cn } from "@/lib/utils";
import { Route } from "../../../route";
import ContactAlphabetList, {
	AlphabetNavigator,
} from "./contact-alphabet-list";
import ContactGroupList from "./contact-group-list";
import ContactItem from "./contact-item";
import GreetingMessageList from "./greeting-message-list";
import useContactAlphabetList from "./use-contact-alphabet-list";
import useContactList, { ContactListContctGroupItem } from "./use-contact-list";

export default function ContactList() {
	const { accountId } = Route.useParams();
	const [location, navigate] = useLocation();
	const isRootActive = location === "/";

	const { data: contactList } = useSuspenseQuery(
		AccountContactListSuspenseQueryOptions({
			account: { id: accountId },
		}),
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
				className={cn("absolute inset-0", WouterFirstPageContentClassName)}
				aria-hidden={!isRootActive}
				inert={!isRootActive}
				style={{
					pointerEvents: isRootActive ? "auto" : "none",
				}}
			>
				<ScrollArea
					ref={(node) => {
						if (node) {
							setScrollTarget(node);
						}
					}}
					className={cn(
						"size-full",
						"[&_[data-slot='scroll-area-scrollbar']]:z-30 [&_[data-slot='scroll-area-scrollbar']]:top-16!",
					)}
				>
					<header className="sticky z-30 top-0 h-16 px-5 flex items-center texture border-b border-muted">
						<div className="size-11 flex items-center justify-center text-[#FF970A] bg-background clothoid-corner-[18.18%] shrink-0">
							<ContactIconFill className="size-8" />
						</div>
						<div className="ms-3 font-semibold">
							<span className="font-medium">联系人</span>
						</div>
					</header>

					{import.meta.env.DEV && (
						<ContactItem
							accountId={accountId}
							contactItem={{
								title: "新的朋友",
								photo: imageGreetingMessages,
							}}
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								navigate("/greetings");
							}}
						/>
					)}

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
				</ScrollArea>
				{scrollTarget && (
					<AlphabetNavigator
						scrollTarget={scrollTarget}
						className="z-20 absolute my-auto top-0 bottom-0 end-1.5"
					/>
				)}
			</section>

			{/* Keep the contact list mounted while a local page is open. */}
			<LocalRoute path="/groups/:groupId">
				{({ groupId }) => {
					return groupId === "group_chats" ? (
						<Suspense key={groupId}>
							<ContactGroupList
								accountId={accountId}
								contactGroup={
									{
										type: "contactGroup",
										id: "group_chats",
										title: "群聊",
										photo: imageGroupChats,
										value: contactListWithGroup.groupChat,
									} satisfies ContactListContctGroupItem
								}
							/>
						</Suspense>
					) : (
						<Redirect to="/" replace />
					);
				}}
			</LocalRoute>

			{import.meta.env.DEV && (
				<LocalRoute path="/greetings">
					<Suspense>
						<GreetingMessageList
							accountId={accountId}
							contactItem={{
								title: "新的朋友",
								photo: imageGreetingMessages,
							}}
						/>
					</Suspense>
				</LocalRoute>
			)}
		</div>
	);
}
