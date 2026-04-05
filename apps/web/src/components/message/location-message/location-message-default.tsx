import { cn } from "@/lib/utils.ts";
import { LocationIcon } from "../../icon";
import { locationMessageVariants } from "./libs.ts";
import type { LocationMessageProps } from "./types.ts";

export function LocationMessageDefault({
	message,
	...props
}: LocationMessageProps) {
	return (
		<div className={cn(locationMessageVariants())} {...props}>
			<LocationIcon />
			<div>
				<h4 className={"font-medium"}>
					{message.message_entity.msg.location["@_poiname"]}
				</h4>
				<p className={"text-sm text-muted-foreground"}>
					{message.message_entity.msg.location["@_label"]}
				</p>
			</div>
		</div>
	);
}
