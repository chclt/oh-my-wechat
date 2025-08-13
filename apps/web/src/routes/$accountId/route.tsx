import { ChatIconFill, ContactIconFill } from "@/components/icon";
import { cn } from "@/lib/utils";
import {
	createFileRoute,
	Link,
	Outlet,
	useNavigate,
	useLocation,
	useCanGoBack,
	useRouter,
} from "@tanstack/react-router";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import ContactList from "./contact/-components/contact-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
	const location = useLocation();
	const { accountId } = Route.useParams();

	const handleNavigateToContact = () => {
		navigate({
			to: location.pathname,
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
						<DialogContent className="p-5 sm:max-w-sm rounded-xl overflow-hidden">
							<VisuallyHidden>
								<DialogHeader>
									<DialogTitle>通讯录</DialogTitle>
								</DialogHeader>
							</VisuallyHidden>

							<ContactList className="-m-5 overflow-hidden" />
						</DialogContent>
					</Dialog>
				</div>
			</aside>

			<Outlet />
		</div>
	);
}
