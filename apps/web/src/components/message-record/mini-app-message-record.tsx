import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import Image from "@/components/image.tsx";
import { CardTitle } from "@/components/ui/card.tsx";
import { RecordImageQueryOptions } from "@/lib/fetchers/record";
import { cn } from "@/lib/utils.ts";
import { Route } from "@/routes/$accountId/route.tsx";
import type { MessageType } from "@/schema";
import { MiniAppMessageRecordType } from "@/schema/message-record.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type React from "react";

interface MiniAppRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: MiniAppMessageRecordType;
	variant: "default" | string;
}

export default function MiniAppMessageRecord({
	message,
	record,
	variant = "default",
	className,
	...props
}: MiniAppRecordProps) {
	if (variant === "default")
		return (
			<MiniAppMessageRecordDefault
				message={message}
				record={record}
				{...props}
			/>
		);

	return (
		<MiniAppMessageRecordInline message={message} record={record} {...props} />
	);
}

function MiniAppMessageRecordDefault({
	message,
	record,
	className,
	...props
}: Omit<MiniAppRecordProps, "variant">) {
	const { accountId } = Route.useParams();

	const { ref: imageRef, inViewport } = useInViewport();

	const { data: image } = useQuery({
		...RecordImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
			record,
		}),
		enabled: inViewport,
	});
	return (
		<div
			className={cn(
				"relative w-52 bg-white rounded-lg overflow-hidden",
				className,
			)}
			{...props}
		>
			<div className="p-2.5 flex flex-col space-y-2.5">
				<div
					className={
						"flex items-center gap-2.5 text-sm text-pretty text-muted-foreground"
					}
				>
					<Image
						src={record.appbranditem.iconurl}
						alt={record.appbranditem.sourcedisplayname}
						className={"w-6 h-6 rounded-full"}
					/>
					<h4>{record.appbranditem.sourcedisplayname}</h4>
				</div>

				{record.datatitle.length > 0 && (
					<CardTitle className="line-clamp-3 leading-normal font-medium text-pretty">
						{record.datatitle}
					</CardTitle>
				)}
			</div>

			<AutoResolutionFallbackImage
				ref={imageRef}
				image={image}
				className={"w-full"}
			/>

			<div className="absolute right-2 bottom-2 w-4 h-4 p-0.5 [&_svg]:size-full rounded-full text-white backdrop-blur backdrop-invert-[0.2]">
				<svg
					width="48"
					height="48"
					viewBox="0 0 48 48"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M34.0086 25.9813L33.5368 25.9889C32.1101 25.9889 31.2799 24.9423 31.8162 23.7357C32.1835 22.8787 33.0121 22.2169 33.9907 21.9995C36.6089 21.3675 38.388 19.3212 38.388 16.9423C38.388 14.0581 35.6343 11.7078 32.195 11.7078C28.7556 11.7078 26.0019 14.0581 26.0019 16.9423V31.3193C26.0019 36.3831 21.4758 40.4618 15.901 40.4618C10.3261 40.4618 5.80005 36.3831 5.80005 31.3193C5.80005 26.8791 9.30474 23.0891 14.0799 22.3685H14.4633C15.5434 22.3685 16.3214 23.0151 16.3214 23.9385C16.3219 24.0967 16.318 24.1699 16.3024 24.2636C16.2813 24.39 16.2403 24.5109 16.1838 24.6217C15.8396 25.4249 14.9595 26.1204 14.0093 26.3579C11.41 26.9853 9.61219 29.0191 9.61219 31.3193C9.61219 34.2034 12.3658 36.5538 15.8051 36.5538C19.2445 36.5538 21.9981 34.2034 21.9981 31.3193V16.9423C21.9981 11.8785 26.5242 7.7998 32.099 7.7998C37.6739 7.7998 42.2001 11.8785 42.2001 16.9423C42.2001 21.406 38.7778 25.1519 34.0086 25.9813Z"
						fill="currentColor"
					/>
				</svg>
			</div>
		</div>
	);
}

function MiniAppMessageRecordInline({
	message,
	record,
	...props
}: Omit<MiniAppRecordProps, "variant">) {
	return <p className="inline">[小程序] {record.datatitle}</p>;
}
