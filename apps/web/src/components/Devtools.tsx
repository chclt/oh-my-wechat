import queryClient from "@/lib/query-client";
import router from "@/lib/router";
import { cn } from "@/lib/utils";
import * as Portal from "@radix-ui/react-portal";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import imageTanstack from "/tanstack-logo-black.svg";

export default function Devtools() {
	return (
		<Portal.Root container={document.body}>
			<TanStackDevtools
				config={{
					customTrigger: (
						<>
							<style>
								{[
									'button[aria-label="Open TanStack Devtools"] {',
									"    left: 0px;",
									"    bottom: 0px;",
									"    transition: none;",
									"}",
								].join("\n")}
							</style>

							<div
								className={cn(
									"w-16 h-16 p-0 flex flex-col items-center justify-center text-sm ",
									"rounded-none hover:bg-neutral-100",
								)}
							>
								<div
									className="size-10 opacity-60"
									style={{
										background: `url(${imageTanstack}) center / cover no-repeat`,
									}}
								/>
							</div>
						</>
					),
					position: "bottom-left",
				}}
				plugins={[
					{
						name: "TanStack Query",
						render: <ReactQueryDevtoolsPanel client={queryClient} />,
					},
					{
						name: "TanStack Router",
						render: <TanStackRouterDevtoolsPanel router={router} />,
					},
				]}
			/>
		</Portal.Root>
	);
}
