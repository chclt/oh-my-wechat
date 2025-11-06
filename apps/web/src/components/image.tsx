import React, { useState } from "react";

export default function Image(
	props: React.ImgHTMLAttributes<HTMLImageElement>,
) {
	const [isError, setIsError] = useState(false);
	const handleOnImageLoad = () => {
		setIsError(false);
	};
	const handleOnImageError = () => {
		setIsError(true);
	};

	return (
		<img
			loading="lazy"
			referrerPolicy="no-referrer"
			onLoad={handleOnImageLoad}
			onError={handleOnImageError}
			data-state={isError ? "error" : undefined}
			{...props}
		/>
	);
}
