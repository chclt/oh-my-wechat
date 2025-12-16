import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import { RecordImageQueryOptions } from "@/lib/fetchers/record";
import { cn } from "@/lib/utils.ts";
import { Route } from "@/routes/$accountId/route.tsx";
import type { MessageType } from "@/schema";
import { ImageMessageRecordType } from "@/schema/message-record.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type React from "react";

interface ImageRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: ImageMessageRecordType;
	variant: "default" | string;
}

export default function ImageMessageRecord({
	message,
	record,
	variant = "default",
	...props
}: ImageRecordProps) {
	if (variant === "default")
		return <ImageRecordDefault message={message} record={record} {...props} />;

	return (
		<ImageMessageRecordInline message={message} record={record} {...props} />
	);
}

function ImageRecordDefault({
	message,
	record,
	className,
	...props
}: Omit<ImageRecordProps, "variant">) {
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
		<div className={cn("rounded-lg overflow-hidden", className)} {...props}>
			<AutoResolutionFallbackImage
				ref={imageRef}
				image={image}
				className="max-w-[16em] max-h-128 min-w-32 min-h-16 object-contain bg-white"
			/>
		</div>
	);
}

function ImageMessageRecordInline({
	message,
	record,
	...props
}: Omit<ImageRecordProps, "variant">) {
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
		<p className="inline">
			<AutoResolutionFallbackImage
				ref={imageRef}
				image={image}
				className="inline mx-[0.2em] align-top max-w-16 max-h-16 rounded overflow-hidden"
			/>
		</p>
	);
}
