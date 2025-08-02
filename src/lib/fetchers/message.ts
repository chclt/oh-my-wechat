import type {
  InfiniteData,
  DefaultError,
  DefinedInitialDataInfiniteOptions,
  QueryKey,
} from "@tanstack/react-query";
import type { MessageController } from "../adapters/ios-backup/controllers/message";
import type { ControllerPaginatorResult, MessageVM } from "../schema";
import adapter from "../adapter";

export function MessageListInfiniteQueryOptions(
  requestData: MessageController.AllInput[0],
): DefinedInitialDataInfiniteOptions<
  ControllerPaginatorResult<MessageVM[]>,
  DefaultError,
  InfiniteData<ControllerPaginatorResult<MessageVM[]>>,
  QueryKey,
  string | undefined
> {
  return {
    queryKey: ["messages", requestData.chat.id],
    queryFn: ({ pageParam, signal }) =>
      adapter.getMessageList({ ...requestData, cursor: pageParam }),
    initialPageParam: undefined,
    getPreviousPageParam: (lastPage) => lastPage.meta.cursor,
    getNextPageParam: (lastPage) => lastPage.meta.cursor,
    initialData: {
      pages: [],
      pageParams: [],
    },
  };
}
