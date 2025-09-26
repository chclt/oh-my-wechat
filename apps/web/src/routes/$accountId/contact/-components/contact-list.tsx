import { ContactIconFill } from "@/components/icon";
import Image from "@/components/image";
import { ScrollBar } from "@/components/ui/scroll-area";
import { AccountContactListSuspenseQueryOptions } from "@/lib/fetchers/contact";
import { cn } from "@/lib/utils";
import { useScrollSpy } from "@mantine/hooks";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { Route } from "../../route";
import useContactList from "./use-contact-list";

export default function ContactList({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [scrollTarget, setScrollTarget] = useState<HTMLDivElement>();

	return (
		<section
			data-alphabet="root"
			className={cn("relative", className)}
			{...props}
		>
			<ScrollAreaPrimitive.Root className="relative h-[calc(100dvh-10rem)]">
				<ScrollAreaPrimitive.Viewport
					ref={(node) => {
						if (node) {
							setScrollTarget(node);
						}
					}}
					className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
				>
					<header className="sticky z-30 top-0 h-16 px-5 flex items-center bg-background/80 border-b border-muted backdrop-blur-xl">
						<div className="size-11 flex items-center justify-center text-[#FF970A] bg-background clothoid-corner-[18.18%] shrink-0">
							<ContactIconFill className="size-8" />
						</div>
						<div className="ms-3 font-semibold">
							<span className="font-medium">联系人</span>
						</div>
					</header>

					<Suspense>
						<PersonalAccountAlphabetList />
					</Suspense>
				</ScrollAreaPrimitive.Viewport>
				<ScrollBar className="z-30" />
				<ScrollAreaPrimitive.Corner />
			</ScrollAreaPrimitive.Root>

			{scrollTarget && (
				<AlphabetNavigator
					scrollTarget={scrollTarget}
					className="z-20 absolute my-auto top-0 bottom-0 end-1.5"
				/>
			)}
		</section>
	);
}

function PersonalAccountAlphabetList() {
	const { accountId } = Route.useParams();

	const { data: contactData } = useSuspenseQuery(
		AccountContactListSuspenseQueryOptions(accountId),
	);

	const { personalAccountAlphabetList } = useContactList(contactData);

	return (
		<ul>
			{personalAccountAlphabetList.map((alphabetLetter) => (
				<div key={alphabetLetter.alphabet}>
					<div
						data-alphabet={alphabetLetter.alphabet}
						className="sticky z-10 top-16 h-11 ps-5 flex items-center bg-background/80 backdrop-blur-xl"
					>
						<div className="h-full w-full ps-0.5 pe-5 flex items-center border-b border-muted">
							{alphabetLetter.alphabet}
						</div>
					</div>

					{alphabetLetter.list.map((item) => (
						<li
							key={item.id}
							style={{
								contentVisibility: "auto",
								containIntrinsicSize: "calc(var(--spacing) * 11)",
							}}
						>
							<Link
								to="/$accountId/chat/$chatId"
								params={{
									accountId,
									chatId: item.id,
								}}
								className="flex gap-2.5 hover:bg-muted"
							>
								<div className="shrink-0 py-2.5 ps-5">
									<div className="w-9 h-9 clothoid-corner-[18.18%]">
										<Image
											src={item.photo?.thumb}
											alt={item.username}
											className="w-full h-full object-cover"
										/>
									</div>
								</div>

								<div className="flex-grow py-2.5 pe-5 flex flex-col justify-center border-b border-muted">
									<span className="font-medium">
										{item.remark ?? item.username ?? " "}
									</span>
								</div>
							</Link>
						</li>
					))}
				</div>
			))}
		</ul>
	);
}

// @mantine/hooks 8.2.3 useScrollSpy bug: 在 scrollHost 更新的时候无法重新绑定滚动监听时间
function AlphabetNavigator({
	scrollTarget,
	className,
	...props
}: { scrollTarget: HTMLDivElement } & React.ComponentProps<"div">) {
	const alphabetListSpy = useScrollSpy({
		selector: '[data-alphabet="root"] [data-alphabet]',
		getDepth: () => 1,
		getValue: (element) => element.getAttribute("data-alphabet") ?? "",
		scrollHost: scrollTarget,
	});

	return (
		<div className={cn("flex", className)} {...props}>
			<RadioGroup.Root
				value={alphabetListSpy.active.toString()}
				className="w-5.5 flex flex-col justify-center items-center text-xs font-medium text-muted-foreground"
			>
				{alphabetListSpy.data.map((letter, index) => (
					<RadioGroup.Item
						key={letter.id}
						value={index.toString()}
						className={cn(
							"w-full h-4 flex items-center justify-center cursor-pointer data-[state=checked]:text-[#03C160]",
						)}
						onClick={() => {
							letter.getNode().scrollIntoView();
						}}
					>
						{letter.value}
					</RadioGroup.Item>
				))}
			</RadioGroup.Root>
		</div>
	);
}
