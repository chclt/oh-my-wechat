import { Field, RadioGroup } from "@base-ui/react";
import { useToggle } from "@mantine/hooks";
import IosBackupAdapter from "@repo/adapter-ios-backup";
import {
	LoadAccountDatabaseMutationOptions,
	LoadDirectoryMutationOptions,
} from "@repo/adapter-ios-backup/queryOptions";
import type { AccountType } from "@repo/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useRef, useState } from "react";
import { ChevronRightSmallLine } from "@/components/central-icon.tsx";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { LoaderIcon } from "@/components/icon.tsx";
import Image from "@/components/image.tsx";
import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { setDataAdapter } from "@/lib/data-adapter.ts";
import { AccountListSuspenseQueryOptions } from "@/lib/fetchers/account";
import queryClient from "@/lib/query-client";
import { cn } from "@/lib/utils.ts";

export default function Configurer(
	props: React.HTMLAttributes<HTMLDivElement>,
) {
	const navigate = useNavigate();

	const adapterRef = useRef<IosBackupAdapter | null>(null);

	function getAdapter() {
		if (adapterRef.current === null) {
			adapterRef.current = new IosBackupAdapter();
		}
		return adapterRef.current;
	}

	const [step, toggleStep] = useToggle<
		"SELECT_DIRECTORY" | "ENTER_PASSWORD" | "SELECT_ACCOUNT"
	>(["SELECT_DIRECTORY", "ENTER_PASSWORD", "SELECT_ACCOUNT"]);
	const [password, setPassword] = useState("");

	const {
		mutateAsync: loadDirectory,
		variables: loadDirectoryVariables,
		error: loadDirectoryError,
		isPending: isLoadingDirectory,
		isSuccess: isLoadDirectorySuccess,
	} = useMutation({
		...LoadDirectoryMutationOptions(getAdapter()),
		onSuccess: async () => {
			const accounts = await queryClient.fetchQuery({
				...AccountListSuspenseQueryOptions(),
				staleTime: 0,
			});
			switch (accounts.length) {
				case 0:
					toggleStep("SELECT_DIRECTORY");
					break;
				case 1:
					handleAccountSelect(accounts[0]);
					break;
				default:
					toggleStep("SELECT_ACCOUNT");
					break;
			}
		},
		onError: (error) => {
			if (error.name === "BackupPasswordRequiredError") {
				toggleStep("ENTER_PASSWORD");
			}
		},
	});

	const {
		mutate: loadAccountDatabase,
		error: loadAccountDatabaseError,
		isPending: isLoadingAccountDatabase,
		isSuccess: isLoadAccountDatabaseSuccess,
	} = useMutation(LoadAccountDatabaseMutationOptions(getAdapter()));

	const handleDirectorySelect = async (
		directoryHandle: FileSystemDirectoryHandle | FileList,
		password?: string,
	) => {
		setDataAdapter(getAdapter());
		try {
			await loadDirectory({ directory: directoryHandle, password });
		} catch {
			// Mutation errors are displayed in the current step.
		}
	};

	const { data: accountList = [] } = useQuery({
		...AccountListSuspenseQueryOptions(),
		enabled: isLoadDirectorySuccess,
	});

	const handleAccountSelect = (account: AccountType) => {
		loadAccountDatabase(account, {
			onSuccess: () => {
				navigate({
					to: "/$accountId",
					params: { accountId: account.id },
				});
			},
			onError: () => {
				toggleStep("SELECT_ACCOUNT");
				setSelectedAccountId(account.id);
			},
		});
	};

	const [selectedAccountId, setSelectedAccountId] = useState<string>();

	const isWorkerEnabled = typeof Worker !== "undefined";
	const isFSAEnabled = "showOpenFilePicker" in window;

	return (
		<main {...props}>
			{step === "SELECT_DIRECTORY" && (
				<div className="grid auto-rows-auto justify-items-center gap-3">
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

					{loadDirectoryError &&
						loadDirectoryError.name !== "BackupPasswordRequiredError" && (
							<p role="alert" className="text-sm text-destructive">
								{loadDirectoryError.message}
							</p>
						)}
				</div>
			)}

			{step === "ENTER_PASSWORD" && (
				<form
					className="justify-self-stretch grid auto-rows-auto gap-4"
					onSubmit={async (event) => {
						event.preventDefault();
						if (
							loadDirectoryVariables &&
							!isLoadingDirectory &&
							!isLoadDirectorySuccess
						) {
							await handleDirectorySelect(
								loadDirectoryVariables.directory,
								password,
							);
						}
					}}
				>
					<Field.Root
						name="backupPassword"
						disabled={isLoadingDirectory || isLoadDirectorySuccess}
						invalid={Boolean(
							loadDirectoryError &&
							loadDirectoryError.name !== "BackupPasswordRequiredError",
						)}
						className="grid auto-rows-auto gap-1"
					>
						<Field.Label className="font-medium">输入备份密码</Field.Label>

						<Field.Control
							type="password"
							autoComplete="off"
							autoFocus
							value={password}
							onValueChange={setPassword}
							className="h-11 rounded-xl border [&:not(:disabled)]:border-foreground bg-background px-3"
						/>

						<Field.Error
							match={Boolean(
								loadDirectoryError &&
								loadDirectoryError.name !== "BackupPasswordRequiredError",
							)}
							className="text-sm text-destructive"
						>
							{loadDirectoryError?.name === "BackupPasswordError"
								? "密码错误，请重试"
								: loadDirectoryError?.name !== "BackupPasswordRequiredError"
									? loadDirectoryError?.message
									: undefined}
						</Field.Error>
					</Field.Root>

					<Button
						type="submit"
						variant="outline"
						className="justify-self-end w-fit h-11 ps-4.5 pe-2 inline-grid grid-flow-col auto-cols-max items-center gap-1 text-base rounded-xl [&:not(:disabled)]:border-foreground [&>svg]:size-6"
						disabled={!password || isLoadingDirectory || isLoadDirectorySuccess}
					>
						打开
						{isLoadingDirectory || isLoadDirectorySuccess ? (
							<LoaderIcon className="scale-90 opacity-75 animate-spin" />
						) : (
							<ChevronRightSmallLine />
						)}
					</Button>
				</form>
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

					<RadioGroup<string>
						className={"flex flex-wrap gap-2.5"}
						value={selectedAccountId ?? ""}
						onValueChange={setSelectedAccountId}
					>
						{accountList.map((account) => (
							<label
								key={account.id}
								className="grow basis-40 relative after:content-[''] after:block after:w-full after:pb-[62.5%]"
							>
								<RadioGroupItem
									value={account.id}
									className={
										"peer z-20 absolute bottom-2 right-2 data-[checked]:border-foreground"
									}
								/>
								<div
									className={
										"z-10 absolute size-full pt-4 pb-3 px-5 flex flex-col justify-center items-center gap-2.5 hover:bg-accent rounded-xl border border-input peer-data-[checked]:border-primary"
									}
								>
									<div
										className={
											"relative min-w-11 w-[27.5%] after:content-[''] after:block after:w-full after:pb-[100%]"
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
								</div>
							</label>
						))}
					</RadioGroup>

					{loadAccountDatabaseError && (
						<p role="alert" className="text-sm text-destructive">
							{loadAccountDatabaseError.message}
						</p>
					)}

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
						onClick={() => {
							if (selectedAccountId) {
								const account = accountList.find(
									(account) => account.id === selectedAccountId,
								);
								if (account) {
									handleAccountSelect(account);
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
