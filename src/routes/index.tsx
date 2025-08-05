import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	BubbleQuestionSolid,
	ChevronRightSmallLine,
	GithubSolid,
	TriangleExclamationLine,
} from "@/components/central-icon.tsx";
import Image from "@/components/image.tsx";
import Link from "@/components/link.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { cn } from "@/lib/utils.ts";
import { LoaderIcon } from "lucide-react";
import { useRef, useState } from "react";
import logo from "/images/logo.svg?url";
import IosBackupAdapter from "@/adapters/ios-backup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AccountListSuspenseQueryOptions } from "@/lib/fetchers/account";
import queryClient from "@/lib/query-client";
import { setDataAdapter } from "@/lib/adapter";
import {
	LoadAccountDatabaseMutationOptions,
	LoadDirectoryMutationOptions,
} from "@/adapters/ios-backup/fetchers";
import type { AccountType } from "@/lib/schema";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	const adapterRef = useRef(new IosBackupAdapter());

	const [adapterInited, setAdapterInited] = useState(false);

	const { mutateAsync: loadDirectory } = useMutation(
		LoadDirectoryMutationOptions(adapterRef.current),
	);

	const { mutateAsync: loadAccountDatabase } = useMutation(
		LoadAccountDatabaseMutationOptions(adapterRef.current),
	);

	const handleDirectorySelect = async (
		directoryHandle: FileSystemDirectoryHandle | FileList,
	) => {
		setDataAdapter(adapterRef.current);
		loadDirectory(directoryHandle).then(() => {
			setAdapterInited(true);
		});

		queryClient.invalidateQueries({
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

	const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
	const [selectedAccountId, setSelectedAccountId] = useState<string>();

	const isWorkerEnabled = typeof Worker !== "undefined";
	const isFSAEnabled = "showOpenFilePicker" in window;

	return (
		<main className={"w-full h-full p-8 flex flex-col"}>
			<div className={"grow grid justify-items-center place-content-center"}>
				<Image
					src={logo}
					alt={"OhMyWechat.com (beta) logo"}
					draggable={false}
					className={"select-none"}
				/>

				<div className={"mt-5"}>
					{isFSAEnabled && !accountList.length && (
						<Button
							variant="outline"
							className="h-12 py-3 pl-6 pr-3.5 inline-flex gap-1 text-base text-foreground [&_svg]:size-6 rounded-xl border-foreground shadow-none"
							disabled={!isWorkerEnabled}
							onClick={async () => {
								if ("showOpenFilePicker" in window) {
									const directoryHandle = await window.showDirectoryPicker();
									if (
										(await directoryHandle.requestPermission()) === "granted"
									) {
										handleDirectorySelect(directoryHandle);
									}
								}
							}}
						>
							选择 iTunes 备份
							<ChevronRightSmallLine />
						</Button>
					)}

					{/* TODO */}
					{!isFSAEnabled && !accountList.length && (
						<label className={"relative"}>
							<input
								type={"file"}
								// @ts-ignore
								webkitdirectory=""
								className={"peer absolute pointer-events-none opacity-0"}
								disabled={!isWorkerEnabled || isLoadingDirectory}
								onChange={(event) => {
									if (event.target.files && event.target.files.length > 0) {
										setIsLoadingDirectory(true);
										loadDirectory(event.target.files);
										event.target.files === null;
									} else {
										setIsLoadingDirectory(false);
										event.target.files === null;
									}
								}}
							/>
							<div
								className={cn(
									"whitespace-nowrap rounded-xl text-base font-medium border transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-1 peer-focus-visible:ring-ring peer-disabled:pointer-events-none peer-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-8 [&_svg]:shrink-0",
									"h-12 py-3 pl-6 pr-3.5 inline-flex gap-1 text-base text-foreground [&_svg]:size-6 rounded-xl border-foreground shadow-none",
								)}
							>
								打开 iTunes 备份
								{isLoadingDirectory ? (
									<LoaderIcon className={"animate-spin"} />
								) : (
									<ChevronRightSmallLine className={""} />
								)}
							</div>
						</label>
					)}
				</div>
				{!!accountList.length && (
					<div className={"justify-self-stretch space-y-4 flex flex-col"}>
						<div className={"flex gap-3 text-foreground"}>
							<div>
								<h4 className={"font-medium"}>选择账号</h4>
								<p className={"text-sm text-black/45"}>
									在备份中找到 {accountList.length} 个账号
								</p>
							</div>
						</div>

						<RadioGroup
							className={"flex flex-wrap gap-4"}
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
										className={"peer z-20 absolute bottom-2 right-2"}
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
								"self-end w-fit h-auto py-1.5 pl-4.5 pr-1.5 flex items-center gap-1 [&_svg]:size-6 text-base rounded-xl shadow-none"
							}
							disabled={!selectedAccountId}
							onClick={async () => {
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
							<ChevronRightSmallLine />
						</Button>
					</div>
				)}
				<p className={"mt-7 flex items-center text-sm text-black/45"}>
					<span
						className={
							"mr-1 shrink-0 size-4.5 [&_svg]:size-full relative bottom-px"
						}
					>
						<TriangleExclamationLine className={"inline"} />
					</span>
					为了防止浏览器插件造成的隐私泄露，建议使用使用无痕模式打开
				</p>
			</div>
			<div className={"flex justify-end gap-4"}>
				<Link
					href="https://github.com/chclt/oh-my-wechat?tab=readme-ov-file#%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E"
					className={
						"h-9 py-2 pl-2 pr-3 inline-flex items-center gap-1.5 [&_svg]:shrink-0 [&_svg]:size-6 hover:underline"
					}
				>
					<BubbleQuestionSolid />
					使用教程
				</Link>

				<Link
					href="https://github.com/chclt/oh-my-wechat/"
					className={
						"h-9 py-2 pl-2 pr-3 inline-flex items-center gap-1.5 [&_svg]:shrink-0 [&_svg]:size-6 hover:underline"
					}
				>
					<GithubSolid />
					开放源代码
				</Link>
			</div>
		</main>
	);
}
