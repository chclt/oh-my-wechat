import { Button } from "@base-ui/react";
import type { ReactNode } from "react";
import { ChevronRightSmallLine } from "@/components/central-icon";
import { LoaderIcon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils.ts";

export interface OpenBackupButtonProps extends Button.Props {
	label: ReactNode;

	loading?: boolean;
}

export function OpenBackupButton({
	label,
	loading,
	disabled,
	className,
	...props
}: OpenBackupButtonProps) {
	return (
		<Button
			className={cn(
				"group",
				buttonVariants({
					variant: "outline",
					size: "default",
					className:
						"h-12 py-3 ps-6 pe-4 inline-flex text-base rounded-xl [&:not(:disabled)]:border-foreground [&>svg]:size-6",
				}),
				className,
			)}
			data-loading={loading}
			disabled={disabled || loading}
			{...props}
		>
			{label}
			<LoaderIcon className="hidden group-data-[loading=true]:block scale-90 opacity-75 animate-spin" />
			<ChevronRightSmallLine className="block group-data-[loading=true]:hidden" />
		</Button>
	);
}
