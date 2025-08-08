import type { RecordType } from "@/components/record/record.tsx";
import { useQuery } from "@tanstack/react-query";
import type { ChatType, MessageType } from "@/schema";
import type React from "react";
import { useInViewport, useMergedRef, useToggle } from "@mantine/hooks";
import { ImageSuspenseQueryOptions } from "@/lib/fetchers";
import { useState } from "react";

type LocalImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
	chat: ChatType;
	message: MessageType;
	record?: RecordType;
	size?: "origin" | "thumb"; // 期望的尺寸，可能因为没有指定尺寸而使用另一尺寸
	domain?: "image" | "opendata" | "video"; // 图片资源默认从 Img 文件夹获取，如果消息里有 appattach 字段，图片在 OpenData 文件夹，如果是视频，缩略图会和视频一样在 Video 文件夹

	ref?: React.Ref<HTMLImageElement>;
};

export default function LocalImage({
	chat,
	message,
	record,
	size = "origin",
	domain = "image",
	alt,
	className,

	ref,
	...props
}: LocalImageProps) {
	const { ref: imgRef, inViewport } = useInViewport();
	const mergedRef = useMergedRef(ref, imgRef);

	const { data: imageInfo, isFetching } = useQuery({
		...ImageSuspenseQueryOptions({
			chat,
			message,
			record,
			size,
			domain,
		}),
		enabled: inViewport,
	});

	const [displayImageIndex, setDisplayImageIndex] = useState(0);
	const [imageErrorMessages, setImageErrorMessages] = useState<string[]>([]);

	const onImageError = (
		error: React.SyntheticEvent<HTMLImageElement, Event>,
	) => {
		if (!imageInfo) return;

		setImageErrorMessages((prev) => {
			const newMessages = [...prev];
			newMessages[displayImageIndex] = "错误";
			return newMessages;
		});

		if (displayImageIndex === imageInfo.length - 1) {
			setDisplayImageIndex(0);
		} else {
			setDisplayImageIndex(displayImageIndex + 1);
		}
	};

	return (
		<div
			className="relative"
			onDoubleClick={() => {
				if (import.meta.env.DEV) {
					console.log(imageInfo);
				}
			}}
		>
			<img
				ref={mergedRef}
				src={imageInfo?.[displayImageIndex]?.src}
				width={imageInfo?.[displayImageIndex]?.width}
				height={imageInfo?.[displayImageIndex]?.height}
				alt={alt}
				loading="lazy"
				className={className}
				onError={onImageError}
				{...props}
			/>
			{(displayImageIndex === 0 && imageErrorMessages[displayImageIndex]) ||
				(displayImageIndex > 0 && imageErrorMessages[displayImageIndex - 1] && (
					<span className="absolute end-1 bottom-1 text-sm">图片解析错误</span>
				))}
		</div>
	);
}
