import Image from "@/components/image";
import { useMiniRouter } from "@/components/mini-router";
import { Link } from "@tanstack/react-router";
import { ContactGroupListMiniRouteState } from "./contact-group-list";
import {
	ContactListContctGroupItem,
	ContactListContctItem,
} from "./use-contact-list";

interface ContactItemProps extends React.HTMLAttributes<HTMLLIElement> {
	accountId: string;
	contactItem: ContactListContctItem | ContactListContctGroupItem;
}

export default function ContactItem({
	accountId,
	contactItem,
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
			<Link
				to="/$accountId/chat/$chatId"
				params={{
					accountId,
					chatId: contactItem.id,
				}}
				className="flex gap-2.5 hover:bg-muted"
				onClick={(event) => {
					if (contactItem.type === "contactGroup") {
						event.preventDefault();
						event.stopPropagation();
						handleOpenContactGroup(contactItem);
					}
				}}
			>
				<div className="shrink-0 py-2.5 ps-5">
					<div className="w-9 h-9 clothoid-corner-[18.18%]">
						<Image
							src={contactItem.photo}
							alt={contactItem.title}
							className="w-full h-full object-cover"
						/>
					</div>
				</div>

				<div className="flex-grow py-2.5 pe-5 flex flex-col justify-center border-b border-muted">
					<span className="font-medium">{contactItem.title}</span>
				</div>
			</Link>
		</li>
	);
}
