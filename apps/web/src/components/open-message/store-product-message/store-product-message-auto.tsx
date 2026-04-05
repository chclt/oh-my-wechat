import { StoreProductMessageAbstract } from "./store-product-message-abstract";
import { StoreProductMessageDefault } from "./store-product-message-default";
import type { StoreProductMessageProps } from "./types";

export interface StoreProductMessageAutoProps extends StoreProductMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function StoreProductMessageAuto({
	message,
	variant,
	...props
}: StoreProductMessageAutoProps) {
	if (variant === "default") {
		return <StoreProductMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <StoreProductMessageAbstract message={message} {...props} />;
	}
}
