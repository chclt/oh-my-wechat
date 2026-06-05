import { createContext, useContext } from "react";

export interface CarouselSliceScrollViewportState {
	isLocked: boolean;
	/**
	 * 分页 prepend 后，react-virtual 会在 layoutEffect 中校正 scrollLeft。
	 * 临时关闭 snap，避免浏览器把校正目标贴到旧 DOM 的 snap-area 上。
	 */
	isSnapDisabled: boolean;
	carouselPaddingStart: number;
	carouselPaddingEnd: number;
}

export interface CarouselScrollViewportContextValue {
	detail: CarouselSliceScrollViewportState;
	thumb: CarouselSliceScrollViewportState;
}

export const CarouselScrollViewportContext =
	createContext<CarouselScrollViewportContextValue | null>(null);

export function useCarouselScrollViewportContext() {
	const value = useContext(CarouselScrollViewportContext);
	if (!value) {
		throw new Error(
			"useCarouselScrollViewportContext must be used within a CarouselScrollViewportContext",
		);
	}
	return value;
}
