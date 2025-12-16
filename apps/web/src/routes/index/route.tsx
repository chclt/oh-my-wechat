import {
	BubbleQuestionSolid,
	GithubSolid,
	TriangleExclamationLine,
} from "@/components/central-icon.tsx";
import Image from "@/components/image.tsx";
import Link from "@/components/link.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import Configurer from "./-components/Configurer";
import ConfigurerErrorFallback from "./-components/ConfigurerErrorFallback";
import logo from "/images/logo.svg?url";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className={"w-full h-full p-8 flex flex-col"}>
			<div className={"grow grid justify-items-center place-content-center"}>
				<ErrorBoundary fallback={<ConfigurerErrorFallback />}>
					<Image
						src={logo}
						alt={"OhMyWechat.com (beta) logo"}
						draggable={false}
						className={"select-none"}
						width={250}
						height={50}
					/>

					<Configurer className="mt-5 w-full" />

					<p className={"mt-7 flex items-center text-sm text-muted-foreground"}>
						<span
							className={
								"mr-1 shrink-0 size-4.5 [&_svg]:size-full relative bottom-px"
							}
						>
							<TriangleExclamationLine className={"inline"} />
						</span>
						为了防止浏览器插件造成的隐私泄露，建议使用使用无痕模式打开
					</p>
				</ErrorBoundary>
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
