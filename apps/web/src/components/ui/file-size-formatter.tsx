const UNITS = ["B", "KB", "MB", "GB"];

interface FileSizeFormatterProps {
	bytes: number;
}

export default function FileSizeFormatter({ bytes }: FileSizeFormatterProps) {
	let size = bytes;
	let unit = UNITS[0];

	for (let i = 0; i < UNITS.length; i++) {
		if (size < 1024) {
			break;
		}

		if (i + 1 < UNITS.length) {
			size /= 1024;
			unit = UNITS[i + 1];
		} else {
			break;
		}
	}

	return `${size.toFixed(2)} ${unit}`;
}
