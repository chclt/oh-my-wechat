import { Field, RadioGroup } from "@base-ui/react";
import type { AccountType } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { ChevronRightSmallLine } from "@/components/central-icon.tsx";
import { DirectoryInputButton } from "@/components/directory-input-button";
import { LoaderIcon } from "@/components/icon.tsx";
import Image from "@/components/image.tsx";
import { Button } from "@/components/ui/button.tsx";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { AccountListSuspenseQueryOptions } from "@/lib/fetchers/account";
import queryClient from "@/lib/query-client";
import { OpenBackupButton } from "./OpenBackupButton";
import { useBackupAdapter } from "./use-backup-adapter";

export default function Configurer(
	props: React.HTMLAttributes<HTMLDivElement>,
) {
	const navigate = useNavigate();

	const [step, setStep] = useState<
		"SELECT_DIRECTORY" | "ENTER_PASSWORD" | "SELECT_ACCOUNT"
	>("SELECT_DIRECTORY");
	const [password, setPassword] = useState("");
	// 覆盖选择目录、加载备份及页面跳转；成功时保持到首页卸载。
	const [isOpeningBackup, setIsOpeningBackup] = useState(false);

	function changeStep(nextStep: typeof step) {
		// 新步骤需要用户继续操作，因此切换步骤时结束本次 loading。
		setIsOpeningBackup(false);
		setStep(nextStep);
	}

	const { loadDirectoryMutation, loadAccountDatabaseMutation } =
		useBackupAdapter({
			onDirectoryLoaded: async () => {
				const accounts = await queryClient.fetchQuery({
					...AccountListSuspenseQueryOptions(),
					staleTime: 0,
				});
				switch (accounts.length) {
					case 0:
						changeStep("SELECT_DIRECTORY");
						break;
					case 1:
						handleAccountSelect(accounts[0]);
						break;
					default:
						changeStep("SELECT_ACCOUNT");
						break;
				}
			},
			onDirectoryError: (error) => {
				if (error.name === "BackupPasswordRequiredError") {
					changeStep("ENTER_PASSWORD");
				} else {
					setIsOpeningBackup(false);
				}
			},
		});

	const { error: loadDirectoryError, isSuccess: isLoadDirectorySuccess } =
		loadDirectoryMutation;

	const { mutate: loadAccountDatabase, error: loadAccountDatabaseError } =
		loadAccountDatabaseMutation;

	const { data: accountList = [] } = useQuery({
		...AccountListSuspenseQueryOptions(),
		enabled: isLoadDirectorySuccess,
	});

	const handleAccountSelect = (account: AccountType) => {
		setIsOpeningBackup(true);
		loadAccountDatabase(account, {
			onSuccess: () => {
				navigate({
					to: "/$accountId",
					params: { accountId: account.id },
				});
			},
			onError: () => {
				changeStep("SELECT_ACCOUNT");
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
						<OpenBackupButton
							label="选择 iTunes 备份"
							loading={isOpeningBackup}
							onClick={async () => {
								setIsOpeningBackup(true);
								try {
									const directoryHandle = await window.showDirectoryPicker();
									if (
										(await directoryHandle.requestPermission()) === "granted"
									) {
										loadDirectoryMutation.mutate({
											directory: directoryHandle,
										});
									} else {
										setIsOpeningBackup(false);
									}
								} catch {
									setIsOpeningBackup(false);
								}
							}}
						/>
					)}

					{!isFSAEnabled && (
						<DirectoryInputButton
							render={
								<OpenBackupButton
									label="打开 iTunes 备份"
									loading={isOpeningBackup}
									disabled={!isWorkerEnabled}
								/>
							}
							onClick={() => setIsOpeningBackup(true)}
							onCancel={() => setIsOpeningBackup(false)}
							onDirectorySelect={async (files) => {
								try {
									await loadDirectoryMutation.mutateAsync({ directory: files });
								} catch {
									// Mutation 的 onDirectoryError 负责错误展示及步骤切换。
								}
							}}
						/>
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
					onSubmit={(event) => {
						event.preventDefault();
						if (!loadDirectoryMutation.variables) return;
						setIsOpeningBackup(true);
						loadDirectoryMutation.mutate({
							...loadDirectoryMutation.variables,
							password,
						});
					}}
				>
					<Field.Root
						name="backupPassword"
						disabled={isOpeningBackup}
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
						disabled={!password || isOpeningBackup}
					>
						打开
						{isOpeningBackup ? (
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
						disabled={!selectedAccountId || isOpeningBackup}
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
						{isOpeningBackup ? (
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
