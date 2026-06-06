import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	ReleaseMessageFileMutationOptions,
	ResolveMessageFileMutationOptions,
} from "@/lib/fetchers/message-file";

/**
 * 按需解析某个文件 uri 对应的真实 src（懒加载）。
 *
 * 挂载或 uri 变更时向适配器请求解析，卸载或切换 uri 前请求释放，
 * 由适配器内部引用计数决定何时真正回收底层资源。
 */
export function useResolveMessageFile(uri?: string): string | undefined {
	const { mutateAsync: resolveMessageFile } = useMutation(
		ResolveMessageFileMutationOptions(),
	);
	const { mutateAsync: releaseMessageFile } = useMutation(
		ReleaseMessageFileMutationOptions(),
	);

	const [resolvedSrc, setResolvedSrc] = useState<string>();

	useEffect(() => {
		setResolvedSrc(undefined);
		if (!uri) return;

		let isActive = true;

		resolveMessageFile({ uri })
			.then((res) => {
				if (isActive) setResolvedSrc(res.data.src);
			})
			.catch((error) => {
				console.error(
					`[useResolveMessageFile] Failed to resolve ${uri}:`,
					error,
				);
			});

		return () => {
			isActive = false;
			releaseMessageFile({ uri }).catch(() => {});
		};
	}, [uri]);

	return resolvedSrc;
}
