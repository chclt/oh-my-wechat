import imageLogo from "/images/logo.svg?url";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import {
	BubbleQuestionSolid,
	GithubSolid,
	TriangleExclamationLine,
} from "@/components/central-icon.tsx";
import ExternalLink from "@/components/external-link.tsx";
import Image from "@/components/image.tsx";
import { clearDataAdapter } from "@/lib/data-adapter";
import { isTauri } from "@/lib/platform";
import Configurer from "./-components/Configurer";
import ConfigurerErrorFallback from "./-components/ConfigurerErrorFallback";

export const Route = createFileRoute("/_index/")({
	beforeLoad: async ({ preload }) => {
		if (!preload) await clearDataAdapter();
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className={"w-full h-full p-8 flex flex-col"}>
			<div className={"grow grid justify-items-center place-content-center"}>
				<ErrorBoundary fallback={<ConfigurerErrorFallback />}>
					<Image
						src={imageLogo}
						alt={"Oh My WeChat logo"}
						draggable={false}
						className={"select-none h-12 w-auto"}
						width={223}
						height={48}
					/>

					<Configurer className="mt-6 w-full" />

					{isTauri && (
						<p
							className={
								"mt-10 flex items-center text-sm text-muted-foreground"
							}
						>
							<span
								className={
									"mr-1 shrink-0 size-4.5 [&_svg]:size-full relative bottom-px"
								}
							>
								<TriangleExclamationLine className={"inline"} />
							</span>
							为了防止浏览器插件造成的隐私泄露，建议使用使用无痕模式打开
						</p>
					)}
				</ErrorBoundary>
			</div>
			<div className={"flex justify-end gap-4"}>
				<ExternalLink
					href="https://github.com/chclt/oh-my-wechat?tab=readme-ov-file#%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E"
					className={
						"h-9 py-2 pl-2 pr-3 inline-flex items-center gap-1.5 [&_svg]:shrink-0 [&_svg]:size-6 hover:underline"
					}
				>
					<BubbleQuestionSolid />
					使用教程
				</ExternalLink>

				<ExternalLink
					href="https://github.com/chclt/oh-my-wechat/"
					className={
						"h-9 py-2 pl-2 pr-3 inline-flex items-center gap-1.5 [&_svg]:shrink-0 [&_svg]:size-6 hover:underline"
					}
				>
					<GithubSolid />
					开放源代码
				</ExternalLink>
			</div>
		</main>
	);
}
