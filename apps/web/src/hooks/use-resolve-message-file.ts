import { useEffect, useState } from "react";
import { getDataAdapter } from "@/lib/data-adapter";

interface ResolvedFile {
	uri: string;
	src?: string;
	error: Error | null;
}

/** 获取和释放使用同一个适配器；引用随 effect 的生命周期结束。 */
export function useResolveMessageFile(uri?: string) {
	const [result, setResult] = useState<ResolvedFile>();

	useEffect(() => {
		setResult(undefined);
		if (!uri) return;
		const adapter = getDataAdapter();
		const referenceId = crypto.randomUUID();
		let active = true;

		adapter.resolveMessageFile({ uri, referenceId }).then(
			({ data: { src } }) => {
				if (active) setResult({ uri, src, error: null });
			},
			(error: Error) => {
				if (!active) return;
				setResult({ uri, error });
				console.error(
					`[useResolveMessageFile] Failed to resolve ${uri}:`,
					error,
				);
			},
		);

		return () => {
			active = false;
			void adapter.releaseMessageFile({ referenceId }).catch(() => {});
		};
	}, [uri]);

	const current = result?.uri === uri ? result : undefined;
	return {
		src: current?.src,
		error: current?.error ?? null,
		isPending: Boolean(uri) && !current,
	};
}
