const WXGF_HEADER = new Uint8Array([0x77, 0x78, 0x67, 0x66]); // "wxgf"

/** Check if data starts with WXGF magic bytes */
export function isWxgf(data: Uint8Array): boolean {
	return (
		data.length >= 4 &&
		data[0] === WXGF_HEADER[0] &&
		data[1] === WXGF_HEADER[1] &&
		data[2] === WXGF_HEADER[2] &&
		data[3] === WXGF_HEADER[3]
	);
}
