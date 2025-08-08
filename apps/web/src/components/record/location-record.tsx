import type { MessageType, RecordTypeEnum } from "@/schema";
import { cn } from "@/lib/utils";
import { LocationIcon } from "../icon";
import { locationMessageVariants } from "../message/location-message";
import type { RecordType } from "./record";
import type React from "react";

interface LocationRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: LocationRecordEntity;
	variant: "default" | string;
}

export interface LocationRecordEntity extends RecordType {
	"@_datatype": RecordTypeEnum.LOCATION;
	locitem: {
		lng: number; // 经度
		buildingid: number; // 建筑ID？
		poiname: string;
		floorname: string; // e.g. "F2"
		label: string;
		isfrompoilist: number; // e.g. 1
		poiid: string; // e.g. "qqmap_00000000000000000000"
		lat: number; // 纬度
		scale: number; // 地图缩放比例
	};
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
