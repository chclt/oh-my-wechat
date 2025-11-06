import type { UserType } from "@/schema";
import { cn } from "@/lib/utils.ts";
import type React from "react";
import { Avatar } from "@/components/ui/avatar.tsx";

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
				<Photo user={user} variant={variant} className="me-[0.15em]" />
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

function Photo({ user, variant = "default", ...props }: UserPhotoProps) {
	return (
		<Avatar
			src={user?.photo?.thumb ?? user?.photo?.origin}
			variant={variant}
			{...props}
		/>
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
