import type { MessageSearchMatch } from "@repo/types/adapter";

export function MessageResultPreview({
	text,
	match,
}: {
	text: string;
	match: MessageSearchMatch;
}) {
	// Bound the work for long messages, then trim by code point to keep surrogate pairs intact.
	const before = Array.from(
		text.slice(Math.max(0, match.start - 48), match.start),
	)
		.slice(-24)
		.join("");
	const after = Array.from(text.slice(match.end, match.end + 144))
		.slice(0, 72)
		.join("");

	return (
		<span className="line-clamp-2 break-all">
			{match.start > before.length && "…"}
			{before}
			<mark className="bg-transparent text-orange-500">
				{text.slice(match.start, match.end)}
			</mark>
			{after}
			{match.end + after.length < text.length && "…"}
		</span>
	);
}
