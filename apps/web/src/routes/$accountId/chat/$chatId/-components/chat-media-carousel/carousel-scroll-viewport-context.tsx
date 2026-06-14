import { createContext, useContext } from "react";

export interface CarouselSliceScrollViewportState {
	isLocked: boolean;
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
