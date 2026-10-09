import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useCallback, useRef } from "react";

export interface DirectoryInputButtonProps extends Omit<
	useRender.ComponentProps<"button">,
	"onCancel"
> {
	onCancel?: () => void;
	onDirectorySelect: (files: FileList) => void | Promise<void>;
}

export function DirectoryInputButton({
	render,
	onCancel,
	onDirectorySelect,
	...props
}: DirectoryInputButtonProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const setInputRef = useCallback(
		(input: HTMLInputElement | null) => {
			inputRef.current = input;
			if (!input) return;

			// React 19.1.1 只给 dialog 注册 cancel 的非委托监听，input 的 JSX onCancel 不会触发。
			// 直接监听原生事件；组件移除或回调更换时解除监听。
			const handleCancel = () => onCancel?.();
			input.addEventListener("cancel", handleCancel);
			return () => {
				input.removeEventListener("cancel", handleCancel);
				inputRef.current = null;
			};
		},
		[onCancel],
	);
	const button = useRender({
		defaultTagName: "button",
		render,
		props: mergeProps<"button">(
			{
				type: "button",
				onClick: () => {
					// 同一次用户点击中打开选择器，保留浏览器要求的用户激活。
					inputRef.current?.click();
				},
			},
			// mergeProps 先执行调用方的 onClick，再执行内部打开选择器的逻辑。
			props,
		),
	});

	return (
		<>
			<input
				ref={setInputRef}
				type="file"
				// @ts-ignore
				webkitdirectory=""
				hidden
				// disabled 只作用于触发按钮；点击回调更新它时，input 仍需完成本次打开。
				onChange={async (event) => {
					const files = event.currentTarget.files;
					if (!files || files.length === 0) {
						onCancel?.();
						return;
					}

					await onDirectorySelect(files);
				}}
			/>
			{button}
		</>
	);
}
