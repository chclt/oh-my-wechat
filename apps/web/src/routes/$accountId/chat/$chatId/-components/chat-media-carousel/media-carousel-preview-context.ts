import { createContext } from "react";

export interface MediaPreviewData {
	src: string;
	width?: number;
	height?: number;
	hasBlurredBackground?: boolean;
}
export const MediaCarouselPreviewHostContext = createContext<string | null>(
	null,
);
