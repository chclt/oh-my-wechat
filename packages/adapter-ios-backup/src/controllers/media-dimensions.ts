/** Message XML uses zero or missing attributes for unknown dimensions. */
export function readMediaDimensions(width?: string, height?: string) {
	const w = Number(width);
	const h = Number(height);
	return {
		width: w > 0 ? w : undefined,
		height: h > 0 ? h : undefined,
	};
}
