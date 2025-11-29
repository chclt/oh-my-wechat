import { GetUserRequest } from "@/adapters/adapter.ts";
import { getDataAdapter } from "@/lib/data-adapter.ts";
import type { UserType } from "@/schema";
import type {
	UseQueryOptions,
	UseSuspenseQueryOptions,
} from "@tanstack/react-query";

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
