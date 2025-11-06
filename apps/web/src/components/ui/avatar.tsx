import type * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Image from "@/components/image.tsx";

const avatarVariants = cva("[&_img[data-state='error']]:invisible", {
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
});

type AvatarProps = React.HTMLAttributes<HTMLElement> &
	VariantProps<typeof avatarVariants> &
	Pick<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
		asChild?: boolean;
	};

function Avatar({
	src,
	asChild = false,
	variant,
	className,
	...props
}: AvatarProps) {
	const Comp = asChild ? Slot : variant === "inline" ? "span" : "div";
	return (
		<Comp className={cn(avatarVariants({ variant, className }))} {...props}>
			<Image src={src} />
		</Comp>
	);
}

export { Avatar, avatarVariants };
