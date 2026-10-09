import { Link } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

export default function LinkPreviewPlaceholder({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"relative size-11 aspect-square place-items-center rounded bg-muted text-muted-foreground/60",
				className,
			)}
			{...props}
		>
			<Link className="absolute inset-0 m-auto size-6" />
		</div>
	);
}
