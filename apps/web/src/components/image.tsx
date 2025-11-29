import React, { useState } from "react";

export default function Image({
	ref,
	onLoad: propOnLoad,
	onError: propOnError,
	...props
}: {
	ref?: React.Ref<HTMLImageElement>;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
	const [isError, setIsError] = useState(false);
	const handleOnImageLoad = () => {
		setIsError(false);
	};
	const handleOnImageError = () => {
		setIsError(true);
	};

	return (
		<img
			ref={ref}
			loading="lazy"
			referrerPolicy="no-referrer"
			onLoad={(event) => {
				handleOnImageLoad();
				propOnLoad?.(event);
			}}
			onError={(event) => {
				handleOnImageError();
				propOnError?.(event);
			}}
			data-state={isError ? "error" : undefined}
			{...props}
		/>
	);
}
