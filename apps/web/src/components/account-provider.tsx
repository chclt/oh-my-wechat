import { createContext, useContext } from "react";

interface AccountContextProps {
	accountId: string;
}

export const AccountProvider = createContext<AccountContextProps | null>(null);

export function useAccount() {
	const context = useContext(AccountProvider);
	if (!context) {
		throw new Error("useAccount must be used within an AccountProvider");
	}
	return context;
}
