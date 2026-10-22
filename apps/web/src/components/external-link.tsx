import { openUrl } from "@tauri-apps/plugin-opener";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { isTauri } from "@/lib/platform";
import Link from "./link";

export default function ExternalLink({
	href,
	onClick,
	onAuxClick,
	...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
	function handleOpen(event: MouseEvent<HTMLAnchorElement>) {
		if (!isTauri || event.defaultPrevented) return;

		event.preventDefault();
		openUrl(href);
	}

	return (
		<Link
			{...props}
			href={href}
			onClick={(event) => {
				onClick?.(event);
				handleOpen(event);
			}}
			onAuxClick={(event) => {
				onAuxClick?.(event);
				if (event.button === 1) handleOpen(event);
			}}
		/>
	);
}
