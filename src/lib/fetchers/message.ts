import type {
  InfiniteData,
  DefaultError,
  DefinedInitialDataInfiniteOptions,
  QueryKey,
  UseQueryOptions,
  UndefinedInitialDataInfiniteOptions,
} from "@tanstack/react-query";
import type { ControllerPaginatorResult, MessageVM } from "../schema";
import type { MessageController } from "@/adapters/ios-backup/controllers/message";
import { getDataAdapter } from "../adapter";

export function MessageListInfiniteQueryOptions(
  accountId: string,
  requestData: MessageController.AllInput[0],
): UndefinedInitialDataInfiniteOptions<
  ControllerPaginatorResult<MessageVM[]>,
  DefaultError,
  InfiniteData<ControllerPaginatorResult<MessageVM[]>>,
  QueryKey,
  string | undefined
> {
  return {
    queryKey: ["messages", accountId, requestData.chat.id, requestData.limit],
    queryFn: ({ pageParam }) =>
      getDataAdapter().getMessageList({
        ...requestData,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getPreviousPageParam: (lastPage) => lastPage.meta.previous_cursor,
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor,
  };
}

export function LastMessageQueryOptions(
  accountId: string,
  requestData: Omit<MessageController.AllInput[0], "limit">,
): UseQueryOptions<MessageVM | null> {
  return {
    queryKey: ["lastMessage", accountId, requestData.chat.id],
    queryFn: () =>
      getDataAdapter()
        .getMessageList({ ...requestData, limit: 1 })
        .then((res) => res.data[0] ?? null),
  };
}
