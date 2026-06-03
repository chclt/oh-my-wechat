import { MessageType } from "@repo/types";

export function createMessageURI({
	message,
	account,
}: {
	message: MessageType;
	account: { id: string };
}) {
	return `omw:account:${account.id}:chat:${message.chat_id}:message:${message.local_id}`;
}

/**
 * 在已知 itemSize、paddingStart、scrollViewportSize 的等宽虚拟列表里，
 * 计算把指定 index 居中所需要写入容器的 scrollLeft（或 scrollTop）。
 *
 * 公式：
 *   scrollOffset = paddingStart + index * itemSize
 *                  - (scrollViewportSize - itemSize) / 2
 *
 * 该函数与 virtualizer 内部状态完全解耦，所以可以在 virtualizer
 * 还没绑定 scrollElement、还没真正测量任何 item 之前调用。
 *
 * 注意：仅在所有 item 等宽时准确。可变尺寸场景需要换用 virtualizer 自身的
 * 测量结果 / getOffsetForIndex。
 */
export function calculateCenteredScrollOffsetForIndex({
	index,
	itemSize,
	paddingStart,
	scrollViewportSize,
}: {
	index: number;
	itemSize: number;
	paddingStart: number;
	scrollViewportSize: number;
}): number {
	const itemStart = paddingStart + index * itemSize;
	return itemStart - (scrollViewportSize - itemSize) / 2;
}
