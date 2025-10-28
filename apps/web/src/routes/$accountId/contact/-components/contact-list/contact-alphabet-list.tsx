import { cn } from "@/lib/utils";
import { useScrollSpy } from "@mantine/hooks";
import * as RadioGroup from "@radix-ui/react-radio-group";
import ContactItem from "./contact-item";
import { UseContactAlphabetListReturnValue } from "./use-contact-alphabet-list";

interface ContactAlphabetListProps {
	accountId: string;
	contactAlphabetList: UseContactAlphabetListReturnValue;
}

export default function ContactAlphabetList({
	accountId,
	contactAlphabetList,
}: ContactAlphabetListProps) {
	return (
		<ul>
			{contactAlphabetList.map((alphabetLetter) => (
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
						<ContactItem
							key={item.id}
							accountId={accountId}
							contactItem={item}
						/>
					))}
				</div>
			))}
		</ul>
	);
}

// @mantine/hooks 8.2.3 useScrollSpy bug: 在 scrollHost 更新的时候无法重新绑定滚动监听时间
interface AlphabetNavigatorProps extends React.ComponentProps<"div"> {
	scrollSpySelector?: string;
	scrollTarget: HTMLDivElement;
}

export function AlphabetNavigator({
	scrollSpySelector = '[data-alphabet="root"] [data-alphabet]',
	scrollTarget,
	className,
	...props
}: AlphabetNavigatorProps) {
	const alphabetListSpy = useScrollSpy({
		selector: scrollSpySelector,
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
