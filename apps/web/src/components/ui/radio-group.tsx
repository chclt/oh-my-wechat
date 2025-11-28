import { cn } from "@/lib/utils";
import {
	Radio as RadioBase,
	RadioGroup as RadioGroupBase,
} from "@base-ui-components/react";
import { CircleIcon } from "lucide-react";
import classes from "./radio-group.module.css";

export function RadioGroup({ className, ...props }: RadioGroupBase.Props) {
	return (
		<RadioGroupBase
			data-slot="radio-group"
			className={cn(classes.Group, className)}
			{...props}
		/>
	);
}

export function RadioGroupItem({ className, ...props }: RadioBase.Root.Props) {
	return (
		<RadioBase.Root
			data-slot="radio-group-item"
			className={cn(classes.Item, className)}
			{...props}
		>
			<RadioBase.Indicator
				data-slot="radio-group-indicator"
				className={classes.Indicator}
			>
				<CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
			</RadioBase.Indicator>
		</RadioBase.Root>
	);
}
