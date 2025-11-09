import type { MessageProp } from "@/components/message/message.tsx";
import User from "@/components/user.tsx";
import type { SystemExtendedMessageType } from "@/schema";
import { XMLParser } from "fast-xml-parser";
import type { ReactNode } from "react";
import { Route } from "@/routes/$accountId/route.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat.ts";

type SystemExtendedMessageProps = MessageProp<SystemExtendedMessageType>;

export interface SystemExtendedMessageEntity {
	sysmsg:
		| {
				"@_type": "editrevokecontent";
				editrevokecontent: {
					text: string; // eg. "You recalled a message"
					link: {
						scene: string; // eg. "editrevokecontent"
						text: string; // eg. "Edit"
						revokecontent: string;
						referid: string;
						atuserlist: string;
						createTime: string;
					};
				};
		  }
		| {
				"@_type": "sysmsgtemplate";
				sysmsgtemplate: {
					content_template: {
						plain: "";
						template: "$username$ invited $names$ to the group chat";
						link_list: {
							link: [
								{
									memberlist: {
										member: {
											username: "wxid";
											nickname: "nickname";
										};
									};
									"@_name": "username";
									"@_type": "link_profile";
								},
								{
									memberlist: {
										member: {
											username: "wxid";
											nickname: "nickname";
										};
									};
									separator: ", ";
									"@_name": "names";
									"@_type": "link_profile";
								},
							];
						};
						"@_type": "tmpl_type_profile";
					};
				};
		  };
}

export default function SystemExtendedMessage({
	message,
	variant = "default",
	...props
}: SystemExtendedMessageProps) {
	if (variant === "default") {
		return <SystemExtendedMessageDefault message={message} {...props} />;
	} else if (variant === "abstract") {
		return <SystemExtendedMessageAbstract message={message} {...props} />;
	}
}

function SystemExtendedMessageDefault({
	message,
	...props
}: Omit<SystemExtendedMessageProps, "variant">) {
	if (message.message_entity.sysmsg) {
		const content = parseXMLContent(message);

		return (
			<div
				className={"mx-auto px-14 text-sm text-center text-neutral-600"}
				{...props}
			>
				<p className="text-pretty">
					<span className="px-2 py-1 box-decoration-clone">
						{message.message_entity.sysmsg["@_type"] === "editrevokecontent" &&
							message.message_entity.sysmsg["editrevokecontent"].text}
						{message.message_entity.sysmsg["@_type"] === "sysmsgtemplate" &&
							content}
					</span>
				</p>
			</div>
		);
	} else {
		const content = usePlainTextContentParser(message);

		return (
			<div
				className={"mx-auto px-14 text-sm text-center text-neutral-600"}
				{...props}
			>
				<p>{content}</p>
			</div>
		);
	}
}

function SystemExtendedMessageAbstract({
	message,
	...props
}: Omit<SystemExtendedMessageProps, "variant">) {
	if (message.message_entity.sysmsg) {
		const content = parseXMLContent(message);
		return (
			<p>
				{message.message_entity.sysmsg["@_type"] === "editrevokecontent" &&
					message.message_entity.sysmsg["editrevokecontent"].text}
				{message.message_entity.sysmsg["@_type"] === "sysmsgtemplate" &&
					content}
			</p>
		);
	} else {
		const content = usePlainTextContentParser(message); // TODO
		// TODO
		return (
			<div {...props}>
				<p>{content}</p>
			</div>
		);
	}
}

function parseXMLContent(message: SystemExtendedMessageType) {
	const { accountId } = Route.useParams();
	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, message.chat_id),
	);

	let content: ReactNode[] = [];
	switch (message.message_entity.sysmsg["@_type"]) {
		case "sysmsgtemplate": {
			const plain =
				message.message_entity.sysmsg.sysmsgtemplate.content_template.template;

			const linkReg = /(\$\S+?\$)/;

			content = plain.split(linkReg).map((s, index) => {
				if (linkReg.test(s)) {
					const linkKey = s.slice(1, -1);

					let linkList =
						// @ts-ignore
						message.message_entity.sysmsg.sysmsgtemplate.content_template
							.link_list.link;
					linkList = Array.isArray(linkList) ? linkList : [linkList];

					const linkObj = linkList.find((i: any) => i["@_name"] === linkKey);

					const linkType = linkObj["@_type"];

					switch (linkType) {
						case "link_profile": {
							// TODO: linkObj.memberlist.member 可能是数组
							const user = chat
								? chat.members.find(
										(member) =>
											member.id === linkObj.memberlist.member.username,
									)
								: undefined;

							return user ? (
								<User
									key={index}
									user={user}
									showPhoto={true}
									variant="inline"
								/>
							) : (
								linkObj.memberlist.member.nickname
							);
						}
						case "link_history":
							return linkObj.title;
						case "link_plain":
							return linkObj.plain;
						case "link_revoke":
						case "new_tmpl_type_succeed_contact":
						case "new_link_succeed_contact": // eg. 在企业微信联系人中，对方工作变更，会告诉你即将自动加另一个联系人，已经添加或者即将添加联系人的时候，都有这个按钮用来不添加联系人
							return null;
						case "link_ecs_gift":
							return linkObj["@_name"];
						case "link_massend_url": // 使用群发助手发送消息会有提示
							return linkObj.title;
						default:
							console.info("不支持的系统消息内容类型：", linkObj);
							return "???";
					}
				}

				return s;
			});
		}
	}

	return content;
}

// 部分系统消息不是XML，如："<a href="weixin://contacts/profile/wxid/"><![CDATA[username]]></a>" stickied a message on top
function usePlainTextContentParser(message: SystemExtendedMessageType) {
	const { accountId } = Route.useParams();
	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, message.chat_id),
	);

	const userLinkReg = /("<a.+<\/a>")/;

	return (
		<>
			{message.raw_message
				.split(userLinkReg)
				.filter((s) => s.length)
				.map((s, index) => {
					if (userLinkReg.test(s)) {
						const xmlParser = new XMLParser({
							ignoreAttributes: false,
						});

						const userLink = xmlParser.parse(s);

						const user = chat
							? chat.members.find(
									(member) =>
										member.id ===
										userLink.a["@_href"]
											.split("/")
											.filter((s: string) => s.length)
											.pop(),
								)
							: null;

						return user ? (
							<User key={index} user={user} variant={"inline"} />
						) : (
							<span key={index}>{userLink["a"]["#text"]}</span>
						);
					}
					return s;
				})}
		</>
	);
}
