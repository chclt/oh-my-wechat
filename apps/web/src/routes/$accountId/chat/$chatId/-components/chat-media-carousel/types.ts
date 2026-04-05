export interface ScrollAreaViewportRelativePosition {
  referenceMessageUri: string;
  /**
   * 相对于 referenceMessageUri 的偏移进度，范围 [0, 1]，0 表示正中，1 表示完全从左边离开视野。
   */
  offsetProgress: number;
}
