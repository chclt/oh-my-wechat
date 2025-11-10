import type {
	UseQueryOptions,
	UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import type { UserType } from "@/schema";
import { getDataAdapter } from "@/lib/data-adapter.ts";

export function UserListQueryOptions(
	accountId: string,
	userIds: string[],
): UseQueryOptions<UserType[]> {
	return {
		queryKey: [`account: ${accountId}`, `userList: ${userIds.join(",")}`],
		queryFn: () =>
			getDataAdapter()
				.getUserList({
					userIds,
				})
				.then((res) => res.data),
	};
}

export function UserSuspenseQueryOptions(
	accountId: string,
	userId: string,
): UseSuspenseQueryOptions<UserType> {
	return {
		queryKey: [`account: ${accountId}`, `user: ${userId}`],
		queryFn: () =>
			getDataAdapter()
				.getUser({
					accountId,
					userId,
				})
				.then((res) => res.data ?? null),
	};
}
