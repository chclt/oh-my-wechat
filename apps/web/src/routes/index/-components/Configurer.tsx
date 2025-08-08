import { useNavigate } from "@tanstack/react-router";
import { ChevronRightSmallLine } from "@/components/central-icon.tsx";
import Image from "@/components/image.tsx";
import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { cn } from "@/lib/utils.ts";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import IosBackupAdapter from "@/adapters/ios-backup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AccountListSuspenseQueryOptions } from "@/lib/fetchers/account";
import queryClient from "@/lib/query-client";
import { setDataAdapter } from "@/lib/data-adapter.ts";
import {
	LoadAccountDatabaseMutationOptions,
	LoadDirectoryMutationOptions,
} from "@/adapters/ios-backup/fetchers";
import type { AccountType } from "@/schema";
import { LoaderIcon } from "@/components/icon.tsx";
import { useToggle } from "@mantine/hooks";

export default function Configurer(
	props: React.HTMLAttributes<HTMLDivElement>,
) {
	const navigate = useNavigate();

	const adapterRef = useRef(new IosBackupAdapter());

	const [adapterInited, setAdapterInited] = useState(false);

	const {
		mutateAsync: loadDirectory,
		isPending: isLoadingDirectory,
		isSuccess: isLoadDirectorySuccess,
	} = useMutation(LoadDirectoryMutationOptions(adapterRef.current));

	const {
		mutateAsync: loadAccountDatabase,
		isPending: isLoadingAccountDatabase,
		isSuccess: isLoadAccountDatabaseSuccess,
	} = useMutation(LoadAccountDatabaseMutationOptions(adapterRef.current));

	const handleDirectorySelect = async (
		directoryHandle: FileSystemDirectoryHandle | FileList,
	) => {
		setDataAdapter(adapterRef.current);
		loadDirectory(directoryHandle).then(() => {
			setAdapterInited(true);
		});

		await queryClient.invalidateQueries({
			queryKey: AccountListSuspenseQueryOptions().queryKey,
		});
	};

	const { data: accountList = [] } = useQuery({
		...AccountListSuspenseQueryOptions(),
		enabled: adapterInited,
	});

	const handleAccountSelect = async (account: AccountType) => {
		loadAccountDatabase(account).then(() => {
			navigate({
				to: "/$accountId",
				params: { accountId: account.id },
			});
		});
	};

	const [step, toggleStep] = useToggle<"SELECT_DIRECTORY" | "SELECT_ACCOUNT">([
		"SELECT_DIRECTORY",
		"SELECT_ACCOUNT",
	]);

	useEffect(() => {
		switch (accountList.length) {
			case 0:
				toggleStep("SELECT_DIRECTORY");
				break;
			case 1:
				handleAccountSelect(accountList[0]);
				break;
			default:
				toggleStep("SELECT_ACCOUNT");
				break;
		}
	}, [accountList.length]);

	const [selectedAccountId, setSelectedAccountId] = useState<string>();

	const isWorkerEnabled = typeof Worker !== "undefined";
	const isFSAEnabled = "showOpenFilePicker" in window;

	return (
		<main {...props}>
			{step === "SELECT_DIRECTORY" && (
				<div className="flex justify-center">
					{isFSAEnabled && (
						<Button
							variant="outline"
							className="h-12 py-3 ps-6 pe-4 inline-flex text-base rounded-xl [&:not(:disabled)]:border-foreground [&>svg]:size-6"
							disabled={isLoadingDirectory}
							onClick={async () => {
								const directoryHandle = await window.showDirectoryPicker();
								if ((await directoryHandle.requestPermission()) === "granted") {
									await handleDirectorySelect(directoryHandle);
								}
							}}
						>
							选择 iTunes 备份
							{isLoadingDirectory ? (
								<LoaderIcon className="scale-90 opacity-75 animate-spin" />
							) : (
								<ChevronRightSmallLine />
							)}
						</Button>
					)}

					{!isFSAEnabled && (
						<label className={"relative"}>
							<input
								type={"file"}
								// @ts-ignore
								webkitdirectory=""
								className={"peer absolute pointer-events-none opacity-0"}
								disabled={
									!isWorkerEnabled ||
									isLoadingDirectory ||
									isLoadDirectorySuccess
								}
								onChange={(event) => {
									if (event.target.files && event.target.files.length > 0) {
										// setIsLoadingDirectory(true)
										handleDirectorySelect(event.target.files).then(() => {
											event.target.files = null;
										});
									} else {
										// setIsLoadingDirectory(false)
										event.target.files = null;
									}
								}}
							/>
							<div
								className={cn(
									buttonVariants({
										variant: "outline",
										size: "default",
										className:
											"h-12 py-3 ps-6 pe-3.5 inline-flex text-base rounded-xl [&:not(:disabled)]:border-foreground",
									}),
								)}
							>
								打开 iTunes 备份
								{isLoadingDirectory || isLoadDirectorySuccess ? (
									<LoaderIcon className="scale-90 opacity-75 animate-spin" />
								) : (
									<ChevronRightSmallLine className={"size-6"} />
								)}
							</div>
						</label>
					)}
				</div>
			)}

			{step === "SELECT_ACCOUNT" && (
				<div className={"justify-self-stretch space-y-4 flex flex-col"}>
					<div className={"flex text-foreground"}>
						<div>
							<h4 className={"font-medium"}>选择账号</h4>
							<p className={"mt-0.5 text-sm text-muted-foreground"}>
								在备份中找到
								<span className="mx-[0.166em]">{accountList.length}</span>
								个账号
							</p>
						</div>
					</div>

					<RadioGroup
						className={"flex flex-wrap gap-2.5"}
						onValueChange={setSelectedAccountId}
					>
						{accountList.map((account) => (
							<div
								key={account.id}
								className="grow basis-40 relative after:content-[''] after:block after:w-full after:pb-[62.5%]"
							>
								<RadioGroupItem
									value={account.id}
									id={account.id}
									className={
										"peer z-20 absolute bottom-2 right-2 data-[state=checked]:border-foreground"
									}
								/>
								<Label
									htmlFor={account.id}
									className={
										"z-10 absolute size-full pt-4 pb-3 px-5 flex flex-col justify-center items-center gap-2.5 hover:bg-accent rounded-xl border border-input peer-data-[state=checked]:border-primary"
									}
								>
									<div
										className={
											"relative min-w-11 w-[27.5%] after:content-[''] after:block after:w-full after:pb-[100%]"

											// className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
										}
									>
										<Image
											src={account.photo?.thumb}
											alt={account.username}
											className={
												"absolute inset-0 size-full clothoid-corner-[18.18%]"
											}
										/>
									</div>
									{account.username}
								</Label>
							</div>
						))}
					</RadioGroup>
					<Button
						variant="outline"
						className={
							"self-end w-fit h-11 ps-4.5 pe-2 flex items-center gap-1 text-base rounded-xl [&:not(:disabled)]:border-foreground [&>svg]:size-6"
						}
						disabled={
							!selectedAccountId ||
							isLoadingAccountDatabase ||
							isLoadAccountDatabaseSuccess
						}
						onClick={async () => {
							if (selectedAccountId) {
								const account = accountList.find(
									(account) => account.id === selectedAccountId,
								);
								if (account) {
									await handleAccountSelect(account);
								}
							}
						}}
					>
						打开
						{isLoadingAccountDatabase || isLoadAccountDatabaseSuccess ? (
							<LoaderIcon className="scale-90 opacity-75 animate-spin" />
						) : (
							<ChevronRightSmallLine />
						)}
					</Button>
				</div>
			)}
		</main>
	);
}
