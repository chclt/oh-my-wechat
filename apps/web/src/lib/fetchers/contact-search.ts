import type { AccountType } from "@repo/types";
import { IgnoredContactIds, specialBrandIds } from "@repo/utils";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { AccountContactListQueryOptions } from "./contact.ts";

export function SearchAccountContactInfiniteQueryOptions(request: {
	account: Pick<AccountType, "id">;
	query: string;
	limit: number;
}) {
	const query = request.query.trim();
	return infiniteQueryOptions({
		queryKey: [
			`account: ${request.account.id}`,
			"SearchContact",
			{ ...request, query },
		],
		enabled: query.length > 0,
		retryOnMount: false,
		queryFn: async ({ client, pageParam: offset }) => {
			const { limit } = request;
			const contacts = await client.ensureQueryData(
				AccountContactListQueryOptions({ account: request.account }),
			);
			const normalizedQuery = query.toLocaleLowerCase();
			// Keep the existing visibility and matching rules; ID matching remains undecided.
			const matches = contacts.filter(
				(contact) =>
					!IgnoredContactIds.includes(contact.id) &&
					!specialBrandIds.includes(contact.id) &&
					!contact.is_openim &&
					!contact.id.startsWith("gh_") &&
					!contact.id.startsWith("mp_") &&
					[
						contact.username,
						contact.usernamePinyin,
						contact.remark,
						contact.remarkPinyin,
						contact.remarkPinyinInits,
					].some((value) =>
						value?.toLocaleLowerCase().includes(normalizedQuery),
					),
			);
			// TODO: Rank contact matches; preserve source order for now.
			return {
				data: matches.slice(offset, offset + limit),
				meta: { total: matches.length, offset, limit },
			};
		},
		initialPageParam: 0,
		getNextPageParam: ({ meta }) => {
			const nextOffset = meta.offset + meta.limit;
			return nextOffset < meta.total ? nextOffset : undefined;
		},
	});
}
