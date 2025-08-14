import type React from "react";

export default function Link({
	href,
	target = "_blank",
	className,
	children,
	...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return (
		<a
			href={href}
			referrerPolicy="no-referrer"
			rel="noopener noreferrer"
			target={target}
			className={className}
			{...props}
		>
			{children}
		</a>
	);
}
