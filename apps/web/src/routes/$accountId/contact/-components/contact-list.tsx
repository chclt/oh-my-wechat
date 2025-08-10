import { AccountContactListSuspenseQueryOptions } from "@/lib/fetchers/contact";
import { Route } from "../../route";
import { useSuspenseQuery } from "@tanstack/react-query";
import useContactList from "./use-contact-list";
import React from "react";
import Image from "@/components/image";
import { Link } from "@tanstack/react-router";

export default function ContactList() {
	const { accountId } = Route.useParams();

	const { data: contactData } = useSuspenseQuery(
		AccountContactListSuspenseQueryOptions(accountId),
	);

	const { personalAccountAlphabetList } = useContactList(contactData);

	return (
		<div>
			<ul className="flex flex-col">
				{personalAccountAlphabetList.map((letter) => (
					<React.Fragment key={letter.alphabet}>
						<div className="py-2.5 px-5">{letter.alphabet}</div>
						<ol key={letter.alphabet} className="flex flex-col">
							{letter.list.map((contact) => (
								<li key={contact.id}>
									<Link
										to="/$accountId/chat/$chatId"
										params={{
											accountId,
											chatId: contact.id,
										}}
										className="flex gap-2.5 hover:bg-muted"
									>
										<div className="shrink-0 py-2.5 ps-5">
											<div className="w-9 h-9 clothoid-corner-[18.18%]">
												<Image
													src={contact.photo?.thumb}
													alt={contact.username}
													className="w-full h-full object-cover"
												/>
											</div>
										</div>

										<div className="flex-grow py-2.5 pe-5 flex flex-col justify-center border-b border-muted">
											<span className="font-medium">
												{contact.remark ?? contact.username ?? " "}
											</span>
										</div>
									</Link>
								</li>
							))}
						</ol>
					</React.Fragment>
				))}
			</ul>
		</div>
	);
}
