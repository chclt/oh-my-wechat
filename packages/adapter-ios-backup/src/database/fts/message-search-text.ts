import type { MessageSearchMatch } from "@repo/types/adapter";

/** One ASCII token per Unicode code point, including whitespace and punctuation. */
export function tokenizeMessageText(text: string): string {
	if (!text.trim()) return "";
	return Array.from(
		text.toLowerCase(),
		(character) => `u${character.codePointAt(0)!.toString(16)}`,
	).join(" ");
}

export function createMessageSearchQuery(searchText: string) {
	const normalizedQuery = searchText.trim().toLowerCase();
	if (!normalizedQuery) return undefined;

	return {
		// A single FTS phrase enforces both order and repetition, before pagination.
		matchExpression: `"${tokenizeMessageText(normalizedQuery)}"`,
		findMatch(text: string): MessageSearchMatch | undefined {
			const start = text.toLowerCase().indexOf(normalizedQuery);
			if (start < 0) return undefined;
			const end = start + normalizedQuery.length;

			// Lowercasing can expand a character (e.g. U+0130). Map back to source offsets.
			let sourceOffset = 0;
			let normalizedOffset = 0;
			let sourceStart = 0;
			for (const character of text) {
				if (normalizedOffset <= start) sourceStart = sourceOffset;
				sourceOffset += character.length;
				normalizedOffset += character.toLowerCase().length;
				if (normalizedOffset >= end) {
					return { start: sourceStart, end: sourceOffset };
				}
			}
			return undefined;
		},
	};
}
