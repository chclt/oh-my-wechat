import { CentralCrossLargeFilledOffStroke2Radius2 } from "@/components/central-icon";
import { ChatIconFill, ContactIconFill } from "@/components/icon";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
	createFileRoute,
	Link,
	Outlet,
	useCanGoBack,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import ContactListMiniRouter from "./contact/-components/contact-list/contact-list-mini-router";

export enum AccountSearchModalOptions {
	CONTACT = "contact",
}

interface AccountSearchProps {
	modal: AccountSearchModalOptions;
}

export const Route = createFileRoute("/$accountId")({
	component: RouteComponent,

	validateSearch: (search) => {
		const validatedSearch: Partial<AccountSearchProps> = {};

		if (search.modal === AccountSearchModalOptions.CONTACT) {
			validatedSearch.modal = AccountSearchModalOptions.CONTACT;
		}

		return validatedSearch;
	},
});

function RouteComponent() {
	const router = useRouter();

	const canGoBack = useCanGoBack();
	const { modal } = Route.useSearch();
	const navigate = useNavigate();
	const { accountId } = Route.useParams();

	const handleNavigateToContact = () => {
		navigate({
			to: ".",
			search: {
				modal: AccountSearchModalOptions.CONTACT,
			},
			mask: {
				to: "/$accountId/contact",
				params: { accountId },
			},
		});
	};

	return (
		<div className="h-full flex items-stretch">
			<aside className={"flex flex-col justify-between border-r"}>
				<div className="flex flex-col">
					<Link
						to="/$accountId/chat"
						params={{ accountId }}
						className={cn(
							"w-16 h-16 p-0 flex flex-col items-center justify-center text-sm ",
							"group text-neutral-500/80 [&.active]:text-[#03C160] rounded-none after:content-none hover:bg-neutral-100",
						)}
					>
						<div className="mt-1 w-8 h-8 [&>svg]:size-full">
							<ChatIconFill />
						</div>
						<span className="mt-0.5 text-xs">消息</span>
					</Link>

					<button
						type="button"
						className={cn(
							"w-16 h-16 p-0 flex flex-col items-center justify-center text-sm ",
							"group text-neutral-500/80 hover:text-[#03C160] rounded-none after:content-none hover:bg-neutral-100",
						)}
						onClick={() => {
							handleNavigateToContact();
						}}
					>
						<div className="mt-1 w-8 h-8 [&>svg]:size-full">
							<ContactIconFill />
						</div>
						<span className="mt-0.5 text-xs">通讯录</span>
					</button>

					<Dialog
						open={modal === AccountSearchModalOptions.CONTACT}
						onOpenChange={(open) => {
							if (!open && canGoBack) {
								router.history.back();
							} else {
								navigate({
									to: "/$accountId/chat",
									params: { accountId },
								});
							}
						}}
					>
						<DialogContent
							showCloseButton={false}
							className="p-5 sm:max-w-sm rounded-xl overflow-hidden"
						>
							<VisuallyHidden>
								<DialogHeader>
									<DialogTitle>通讯录</DialogTitle>
								</DialogHeader>
							</VisuallyHidden>

							<div className="relative -m-5 overflow-hidden">
								<ContactListMiniRouter />
							</div>

							<DialogClose
								data-slot="dialog-close"
								className={cn(
									"z-40 absolute top-5 right-5 size-6 rounded-xs cursor-pointer",
									"data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
									"ring-offset-background focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
									"[&_svg]:pointer-events-none [&_svg]:size-full",
								)}
							>
								<CentralCrossLargeFilledOffStroke2Radius2 />
							</DialogClose>
						</DialogContent>
					</Dialog>
				</div>
			</aside>

			<Outlet />
		</div>
	);
}
