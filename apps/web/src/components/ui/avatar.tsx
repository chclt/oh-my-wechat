import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { useState } from "react";
import Image from "@/components/image.tsx";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
	"[&_img:not([src])]:invisible [&_img[data-state='error']]:invisible",
	{
		variants: {
			variant: {
				default:
					"size-11 aspect-square clothoid-corner-[18.18%] bg-neutral-200 [&_img]:size-full [&_img]:rounded-[inherit]",
				inline:
					"relative inline-block size-[1.5em] align-top rounded-[3px] [&_img]:inline [&_img]:absolute [&_img]:inset-0 [&_img]:m-auto [&_img]:size-[1.25em] [&_img]:rounded-[inherit]",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type AvatarProps = React.HTMLAttributes<HTMLElement> &
	VariantProps<typeof avatarVariants> &
	Pick<React.ImgHTMLAttributes<HTMLImageElement>, "src">;

function Avatar({ src, variant, className, ...props }: AvatarProps) {
	const [invalidSrc, setInvalidSrc] = useState<string>();
	const Comp = variant === "inline" ? "span" : "div";
	return (
		<Comp
			className={cn(
				avatarVariants({ variant, className }),
				src && src === invalidSrc && "[&_img]:invisible",
			)}
			{...props}
		>
			<Image
				key={src}
				src={src}
				onLoad={({ currentTarget: image }) => {
					// 微信的失效头像占位图是一张 120×120 图，这里对比图像宽高来判断图像是否失效。
					// 当然，这种方法不准确，经过测试，”公众平台安全助手“ 的正常头像也会被此规则误判。
					setInvalidSrc(
						image.naturalWidth === 120 && image.naturalHeight === 120
							? src
							: undefined,
					);
				}}
			/>
		</Comp>
	);
}

export { Avatar, avatarVariants };
