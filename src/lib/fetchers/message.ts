import type {
  InfiniteData,
  DefaultError,
  DefinedInitialDataInfiniteOptions,
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { MessageController } from "../adapters/ios-backup/controllers/message";
import type { ControllerPaginatorResult, MessageVM } from "../schema";
import dataClient from "../adapter";

export function MessageListInfiniteQueryOptions(
  accountId: string,
  requestData: MessageController.AllInput[0],
): DefinedInitialDataInfiniteOptions<
  ControllerPaginatorResult<MessageVM[]>,
  DefaultError,
  InfiniteData<ControllerPaginatorResult<MessageVM[]>>,
  QueryKey,
  string | undefined
> {
  return {
    queryKey: ["messages", accountId, requestData.chat.id, requestData.limit],
    queryFn: ({ pageParam, signal }) =>
      dataClient.adapter.getMessageList({ ...requestData, cursor: pageParam }),
    initialPageParam: undefined,
    getPreviousPageParam: (lastPage) => lastPage.meta.cursor,
    getNextPageParam: (lastPage) => lastPage.meta.cursor,
    initialData: {
      pages: [],
      pageParams: [],
    },
  };
}

export function LastMessageQueryOptions(
  accountId: string,
  requestData: Omit<MessageController.AllInput[0], "limit">,
): UseQueryOptions<MessageVM | null> {
  return {
    queryKey: ["lastMessage", accountId, requestData.chat.id],
    queryFn: () =>
      dataClient.adapter
        .getMessageList({ ...requestData, limit: 1 })
        .then((res) => res.data[0] ?? null),
  };
}
