import { MessageType } from "@repo/types";
import { Virtualizer } from "@tanstack/react-virtual";

export function createMessageURI({
  message,
  account,
}: {
  message: MessageType;
  account: { id: string };
}) {
  return `omw:account:${account.id}:chat:${message.chat_id}:message:${message.local_id}`;
}

export function isVirtualizerReadyForScroll(
  virtualizer: Virtualizer<HTMLDivElement, Element>,
) {
  const totalSize = virtualizer.getTotalSize();
  const scrollElement = virtualizer.scrollElement;

  return !!scrollElement && totalSize > 0;
}
