import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function decodeUnicodeReferences(encodedHTMLComponent: string) {
	try {
		return encodedHTMLComponent.replace(/&#x(.*?);/g, (_, p1) =>
			String.fromCodePoint(Number.parseInt(p1, 16)),
		);
	} catch (error) {
		if ((typeof encodedHTMLComponent as unknown) === "number") {
			// XMLParser 会把数字内容字符串转换为数字，这个时候会报错，但是也不需要转换
			// 但是遇到了应该把这个字段放到 fast-xml-parser 解析的白名单里
		}
		console.error(error);
		return encodedHTMLComponent;
	}
}

export function formatDateTime(date: Date) {
	return date.toLocaleString("zh-CN", {});
}
