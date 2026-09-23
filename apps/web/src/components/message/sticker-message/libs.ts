import { fromBinary } from "@bufbuild/protobuf";
import {
	StickerMessageDescriptionSchema,
	type StickerMessageEntity,
} from "@repo/types";

export function getStickerMessageDescription(encodedDescription: string) {
	const { entries } = fromBinary(
		StickerMessageDescriptionSchema,
		Uint8Array.from(atob(encodedDescription), (char) => char.charCodeAt(0)),
	);
	return (
		entries.find((entry) => entry.locale === "zh_cn" && entry.text)?.text ||
		entries.find((entry) => entry.text)?.text
	);
}

export function getStickerImageDimensions(
	emoji: Pick<StickerMessageEntity["msg"]["emoji"], "@_width" | "@_height">,
) {
	const rawWidth = emoji["@_width"];
	const rawHeight = emoji["@_height"];
	if (!rawWidth || !rawHeight) return undefined;

	const width = Number(rawWidth);
	const height = Number(rawHeight);
	const scale = Math.min(0.5, 128 / Math.max(width, height));
	return {
		width,
		height,
		displayWidth: width * scale,
		displayHeight: height * scale,
	};
}
