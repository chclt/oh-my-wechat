import { LoaderIcon } from "@/components/icon";
import { cn } from "@/lib/utils";

export default function MessageListPageStatus({
	position,
	failed,
	onRetry,
}: {
	position: "top" | "bottom";
	failed: boolean;
	onRetry: () => void;
}) {
	return (
		<div
			className={cn(
				"absolute inset-x-0 flex justify-center text-neutral-400",
				position === "top" ? "top-20" : "bottom-4",
			)}
		>
			{failed ? (
				<button type="button" className="text-sm" onClick={onRetry}>
					加载失败，重试
				</button>
			) : (
				<span role="status" aria-label="加载聊天记录">
					<LoaderIcon className="size-5 animate-spin" />
				</span>
			)}
		</div>
	);
}
