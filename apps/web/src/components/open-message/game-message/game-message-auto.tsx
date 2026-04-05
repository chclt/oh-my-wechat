import { GameMessageAbstract } from "./game-message-abstract";
import { GameMessageDefault } from "./game-message-default";
import type { GameMessageProps } from "./types";

export interface GameMessageAutoProps extends GameMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function GameMessageAuto({
	message,
	variant,
	...props
}: GameMessageAutoProps) {
	if (variant === "default") {
		return <GameMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <GameMessageAbstract message={message} {...props} />;
	}
}
