import type { UserType } from "@repo/types";
import { GetUserRequest } from "@repo/types/adapter";
import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import { getDataAdapter } from "@/lib/data-adapter.ts";

export function UserListQueryOptions(
	accountId: string,
	userIds: string[],
): UseSuspenseQueryOptions<UserType[]> {
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
	requestData: GetUserRequest,
): UseSuspenseQueryOptions<UserType> {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`user: ${requestData.user.id}`,
		],
		queryFn: () =>
			getDataAdapter()
				.getUser(requestData)
				.then((res) => res.data ?? null),
	};
}
