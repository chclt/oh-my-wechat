import type { UseQueryOptions } from "@tanstack/react-query";
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
				.then((res) => res.data),
	};
}
