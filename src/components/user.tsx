import Image from "@/components/image.tsx";
import type { UserType } from "@/schema";
import { cn } from "@/lib/utils.ts";

interface UserProps extends React.HTMLProps<HTMLDivElement> {
	user: UserType;
	showPhoto?: boolean;
	showUsername?: boolean;
	variant?: "default" | "inline";
}

const userVariants = {
	container: {
		default: "",
		inline: "inline font-medium cursor-pointer hover:underline",
	},
	photo: {
		default:
			"shrink-0 size-11 aspect-square rounded-[18.18%] clothoid-corner-[18.18%] bg-neutral-200",
		inline:
			"relative inline-block size-[1.5em] align-top [&_img]:inline [&_img]:absolute [&_img]:inset-0 [&_img]:m-auto [&_img]:size-[1.25em] [&_img]:rounded-[3px]",
	},
	username: {
		default: "",
		inline: "",
	},
};

export default function User({
	user,
	showPhoto = true,
	showUsername = true,
	variant = "default",

	className,
	...props
}: UserProps) {
	const Container = variant === "inline" ? "span" : "div";

	return (
		<Container
			className={cn(userVariants.container[variant], className)}
			{...props}
		>
			{showPhoto && (
				<Photo
					user={user}
					variant={variant}
					className={cn(userVariants.photo[variant], "me-[0.15em]")}
				/>
			)}
			{showUsername && (
				<Username
					user={user}
					variant={variant}
					className={userVariants.username[variant]}
				/>
			)}
		</Container>
	);
}

interface UserPhotoProps extends React.HTMLAttributes<unknown> {
	user: UserType;
	variant: "default" | "inline";
}

function Photo({
	user,
	variant = "default",
	className,
	...props
}: UserPhotoProps) {
	if (variant === "inline") {
		return (
			<span className={cn(userVariants.photo[variant], className)}>
				{user.photo && <Image src={user.photo.thumb ?? user.photo?.origin} />}
			</span>
		);
	}
	return user.photo ? (
		<Image
			src={user.photo.thumb ?? user.photo?.origin}
			className={cn(userVariants.photo[variant], className)}
			{...props}
		/>
	) : (
		<div className={cn(userVariants.photo[variant], className)} />
	);
}

User.Photo = Photo;

interface UserNameProps extends React.HTMLAttributes<unknown> {
	user: UserType;

	variant: "default" | "inline";
}

function Username({
	user,
	variant = "default",
	className,
	...props
}: UserNameProps) {
	return (
		<span className={cn(userVariants.username[variant], className)} {...props}>
			{user.remark ?? user.username}
		</span>
	);
}

User.Username = Username;
