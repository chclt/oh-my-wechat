import type React from "react";

export default function Image({
	src,
	alt,
	className,
	...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
	return (
		<img
			src={src}
			alt={alt}
			loading="lazy"
			referrerPolicy="no-referrer"
			className={className}
			{...props}
		/>
	);
}
