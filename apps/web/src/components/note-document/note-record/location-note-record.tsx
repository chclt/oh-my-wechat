import { LocationIcon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { RecordTypeEnum } from "@/schema";

export interface LocationNoteRecordEntity {
	"@_datatype": RecordTypeEnum.LOCATION;
	"@_dataid": string;
	"@_htmlid": string;

	locitem: {
		poiname: string;
		label: string;
		isfrompoilist: number;
		poiid: string;
		lng: number;
		lat: number;
		scale: number;
	};
}

interface LocationNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	recordEntity: LocationNoteRecordEntity;
}

export default function LocationNoteRecord({
	recordEntity,
	className,
	...props
}: LocationNoteRecordProps) {
	return (
		<div
			className={cn(
				"py-3 ps-3 pe-5.5 flex items-center gap-3 bg-muted rounded-xs [&_svg]:shrink-0 text-pretty",
				className,
			)}
			{...props}
		>
			<LocationIcon />
			<div>
				<h4 className={"font-medium"}>{recordEntity.locitem.poiname}</h4>
				<p className={"text-sm text-muted-foreground"}>
					{recordEntity.locitem.label}
				</p>
			</div>
		</div>
	);
}
