import type {
	UseQueryOptions,
	UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import type { UserType } from "@/schema";
import { getDataAdapter } from "@/lib/data-adapter.ts";

export function UserListQueryOptions(
	userIds: string[],
): UseQueryOptions<UserType[]> {
	return {
		queryKey: ["users", userIds],
		queryFn: () =>
			getDataAdapter()
				.getUserList({
					userIds,
				})
				.then((res) => res.data)
				.catch((e) => {
					throw e;
				}),
	};
}

export function UserSuspenseQueryOptions(
	accountId: string,
	userId: string,
): UseSuspenseQueryOptions<UserType> {
	return {
		queryKey: ["user", accountId, userId],
		queryFn: () =>
			getDataAdapter()
				.getUser({
					accountId,
					userId,
				})
				.then((res) => res.data)
				.catch((e) => {
					throw e;
				}),
	};
}
