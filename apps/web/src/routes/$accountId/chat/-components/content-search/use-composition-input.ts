import {
	type ChangeEventHandler,
	type CompositionEventHandler,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

interface UseCompositionInputParameters {
	value: string;
	onValueChange: (value: string) => void;
}

export function useCompositionInput({
	value,
	onValueChange,
}: UseCompositionInputParameters) {
	const [inputValue, setInputValue] = useState(value);
	const isComposingRef = useRef(false);

	useEffect(() => {
		if (!isComposingRef.current) {
			setInputValue(value);
		}
	}, [value]);

	const handleCompositionStart = useCallback(() => {
		isComposingRef.current = true;
	}, []);

	const handleCompositionEnd = useCallback<
		CompositionEventHandler<HTMLInputElement>
	>(
		(event) => {
			const nextValue = event.currentTarget.value;
			isComposingRef.current = false;
			setInputValue(nextValue);
			onValueChange(nextValue);
		},
		[onValueChange],
	);

	const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
		(event) => {
			const nextValue = event.target.value;
			setInputValue(nextValue);
			if (!isComposingRef.current) {
				onValueChange(nextValue);
			}
		},
		[onValueChange],
	);

	const resetInputValue = useCallback((nextValue = "") => {
		isComposingRef.current = false;
		setInputValue(nextValue);
	}, []);

	return {
		inputValue,
		onChange: handleChange,
		onCompositionStart: handleCompositionStart,
		onCompositionEnd: handleCompositionEnd,
		resetInputValue,
	};
}
