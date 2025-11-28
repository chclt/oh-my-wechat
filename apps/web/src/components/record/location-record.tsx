import type { MessageType } from "@/schema";
import { cn } from "@/lib/utils";
import { LocationIcon } from "../icon";
import { locationMessageVariants } from "../message/location-message";
import type React from "react";
import { LocationMessageRecordType } from "@/schema/message-record.ts";

interface LocationRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: LocationMessageRecordType;
	variant: "default" | string;
}

export default function LocationRecord({
	message,
	record,
	variant = "default",
	...props
}: LocationRecordProps) {
	if (variant === "default")
		return (
			<div className={cn(locationMessageVariants())} {...props}>
				<LocationIcon />
				<div>
					<h4 className={"font-medium"}>{record.locitem.poiname}</h4>
					<p className={"text-sm text-muted-foreground"}>
						{record.locitem.label}
					</p>
				</div>
			</div>
		);

	return (
		<p className={"inline"} {...props}>
			[位置] {record.locitem.poiname} {record.locitem.label}
		</p>
	);
}
