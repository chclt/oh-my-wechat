export interface ScrollAreaViewportRelativePosition {
	referenceMessageUri: string;
	/**
	 * viewport 中心相对 referenceMessageUri 对应 item 中心的归一化偏移。
	 * 0 表示两个中心对齐，-1 / 1 表示 viewport 中心位于该 item 的左 / 右边缘。
	 */
	offsetProgress: number;
}
