import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
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
export function useResolveMessageFile(uri?: string) {
	const {
		mutateAsync: resolveMessageFile,
		data,
		variables,
		error,
		isPending,
		isIdle,
	} = useMutation(ResolveMessageFileMutationOptions());
	const { mutateAsync: releaseMessageFile } = useMutation(
		ReleaseMessageFileMutationOptions(),
	);

	useEffect(() => {
		if (!uri) return;
		const referenceId = crypto.randomUUID();

		resolveMessageFile({ uri, referenceId }).catch((error) => {
			console.error(`[useResolveMessageFile] Failed to resolve ${uri}:`, error);
		});

		return () => {
			releaseMessageFile({ referenceId }).catch(() => {});
		};
	}, [uri]);

	const isCurrent = variables?.uri === uri;
	return {
		src: isCurrent ? data?.data.src : undefined,
		error: isCurrent ? error : null,
		isPending: Boolean(uri) && (!isCurrent || isPending || isIdle),
	};
}
