import { useMiniRouter } from "@/components/mini-router";
import { Link } from "@tanstack/react-router";
import { ContactGroupListMiniRouteState } from "./contact-group-list";
import {
	ContactListContctGroupItem,
	ContactListContctItem,
} from "./use-contact-list";
import { Avatar } from "@/components/ui/avatar.tsx";
import React from "react";

type ContactItemProps = {
	accountId: string;
	contactItem:
		| ContactListContctItem
		| ContactListContctGroupItem
		| {
				photo: string;
				title: string;
		  };
} & Pick<React.HTMLAttributes<HTMLAnchorElement>, "onClick"> &
	React.HTMLAttributes<HTMLLIElement>;

export default function ContactItem({
	accountId,
	contactItem,

	onClick,
}: ContactItemProps) {
	const { states: miniRouterStates, pushState: pushMiniRouterState } =
		useMiniRouter();

	const handleOpenContactGroup = (
		contactListContactGroupItem: ContactListContctGroupItem,
	) => {
		pushMiniRouterState({
			name: "contactGroupList",
			data: {
				accountId,
				contctGroup: contactListContactGroupItem,
			},
		} satisfies ContactGroupListMiniRouteState);
	};

	return (
		<li
			style={{
				contentVisibility: "auto",
				containIntrinsicSize: "calc(var(--spacing) * 11)",
			}}
		>
			{"id" in contactItem && (
				<Link
					to="/$accountId/chat/$chatId"
					params={{
						accountId,
						chatId: contactItem.id,
					}}
					className="flex gap-2.5 hover:bg-muted"
					onClick={(event) => {
						if (onClick) {
							onClick(event);
						} else {
							if (contactItem.type === "contactGroup") {
								event.preventDefault();
								event.stopPropagation();
								handleOpenContactGroup(contactItem);
							}
						}
					}}
				>
					<ContactItemContent
						photo={contactItem.photo}
						title={contactItem.title}
					/>
				</Link>
			)}

			{!("id" in contactItem) && (
				<a href="#" className="flex gap-2.5 hover:bg-muted" onClick={onClick}>
					<ContactItemContent
						photo={contactItem.photo}
						title={contactItem.title}
					/>
				</a>
			)}
		</li>
	);
}

interface ContactItemContentProps {
	photo: string;
	title: string;
}

function ContactItemContent({ photo, title }: ContactItemContentProps) {
	return (
		<>
			<div className="shrink-0 py-2.5 ps-5">
				<Avatar src={photo} className="w-9 h-9" />
			</div>

			<div className="flex-grow py-2.5 pe-5 flex flex-col justify-center border-b border-muted">
				<span className="font-medium">{title}</span>
			</div>
		</>
	);
}
