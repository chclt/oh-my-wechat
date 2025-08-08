import { cn } from "@/lib/utils.ts";
import type React from "react";

export default function FileTypeIcon({
	className,
	...props
}: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="48"
			height="48"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("file-type-icon", className)}
			{...props}
		>
			<style>{`
            .file-type-icon path {
              transition: d 0.2s;
            }
            .file-type-icon_trigger:hover .file-type-icon_background {
              d: path("M6 4C6 1.79086 7.79086 0 10 0H27.1716C27.702 0 28.2107 0.210714 28.5858 0.585786L41.4142 13.4142C41.7893 13.7893 42 14.298 42 14.8284V44C42 46.2091 40.2091 48 38 48H10C7.79086 48 6 46.2091 6 44V4Z")
            }
            .file-type-icon_trigger:hover .file-type-icon_bevel-left {
              d: path("M27.1716 0H27C27.5523 0 28 0.447715 28 1V2H30L28.5858 0.585787C28.2107 0.210714 27.702 0 27.1716 0Z")
            }            
           .file-type-icon_trigger:hover .file-type-icon_bevel-right {
              d: path("M42 14.8284L42 15C42 14.4477 41.5523 14 41 14L40 14L40 12L41.4142 13.4142C41.7893 13.7893 42 14.298 42 14.8284Z")
            }
           .file-type-icon_trigger:hover .file-type-icon_bevel {
              d: path("M32 14H40.7929C41.2383 14 41.4614 13.4614 41.1464 13.1464L28.8536 0.853554C28.5386 0.538571 28 0.761654 28 1.20711V10C28 12.2091 29.7909 14 32 14Z")
            }
        }
        `}</style>
			<path
				className="file-type-icon_background"
				d="M6 4C6 1.79086 7.79086 0 10 0H31.1716C31.702 0 32.2107 0.210714 32.5858 0.585786L41.4142 9.41421C41.7893 9.78929 42 10.298 42 10.8284V44C42 46.2091 40.2091 48 38 48H10C7.79086 48 6 46.2091 6 44V4Z"
				fill="#A4A4A4"
			/>
			<path
				className="file-type-icon_banner"
				d="M6 30H42V41.1733C42 43.5629 42 44.7577 41.535 45.6704C41.1259 46.4732 40.4732 47.1259 39.6704 47.535C38.7577 48 37.5629 48 35.1733 48H12.8267C10.4371 48 9.24233 48 8.32964 47.535C7.52682 47.1259 6.8741 46.4732 6.46504 45.6704C6 44.7577 6 43.5629 6 41.1733V30Z"
				fill="#858585"
			/>
			<path
				className="file-type-icon_bevel-left"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M31.1716 0H31C31.5523 0 32 0.447715 32 1V2H34L32.5858 0.585787C32.2107 0.210714 31.702 0 31.1716 0Z"
				fill="#BFBFBF"
			/>
			<path
				className="file-type-icon_bevel-right"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M42 10.8284L42 11C42 10.4477 41.5523 10 41 10L40 10L40 8L41.4142 9.41421C41.7893 9.78929 42 10.298 42 10.8284Z"
				fill="#BFBFBF"
			/>
			<path
				className="file-type-icon_bevel"
				d="M36 10H40.7929C41.2383 10 41.4614 9.46143 41.1464 9.14645L32.8536 0.853554C32.5386 0.538571 32 0.761654 32 1.20711V6C32 8.20914 33.7909 10 36 10Z"
				fill="#BFBFBF"
			/>
		</svg>
	);
}
