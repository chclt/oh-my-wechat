import { createContext, useContext } from "react";

interface ChatContextProps {
	showUsername: boolean;
	showPhoto: boolean;
}

export const ChatUiConfigProvider = createContext<ChatContextProps | null>(
	null,
);

export function useChatUiConfig() {
	const context = useContext(ChatUiConfigProvider);
	if (!context) {
		throw new Error(
			"useChatUiConfig must be used within an ChatUiConfigProvider",
		);
	}
	return context;
}
