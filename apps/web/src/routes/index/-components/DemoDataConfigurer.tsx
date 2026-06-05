import DemoDataAdapter from "@/adapters/demo-data";
import { setDataAdapter } from "@/lib/data-adapter.ts";
import { AccountListSuspenseQueryOptions } from "@/lib/fetchers/account";
import queryClient from "@/lib/query-client";
import type { AccountType } from "@/schema";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export default function DemoDataConfigurer(
	props: React.HTMLAttributes<HTMLButtonElement>,
) {
	const navigate = useNavigate();

	const adapterRef = useRef<DemoDataAdapter | null>(null);

	function getDemoDataAdapter() {
		if (adapterRef.current === null) {
			adapterRef.current = new DemoDataAdapter();
		}
		return adapterRef.current;
	}

	const [adapterInited, setAdapterInited] = useState(false);

	const handleInitDemoDataAdapter = async () => {
		setDataAdapter(getDemoDataAdapter());

		setAdapterInited(true);

		await queryClient.invalidateQueries({
			queryKey: AccountListSuspenseQueryOptions().queryKey,
		});
	};

	const { data: accountList = [] } = useQuery({
		...AccountListSuspenseQueryOptions(),
		enabled: adapterInited,
	});

	const handleAccountSelect = async (account: AccountType) => {
		navigate({
			to: "/$accountId",
			params: { accountId: account.id },
		});
	};

	useEffect(() => {
		switch (accountList.length) {
			case 1:
				handleAccountSelect(accountList[0]);
				break;
			default:
				// not implemented
				break;
		}
	}, [accountList]);

	return <button {...props} onClick={() => handleInitDemoDataAdapter()} />;
}
