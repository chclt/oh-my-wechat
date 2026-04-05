import { cva } from "class-variance-authority";

export const locationMessageVariants = cva(
	"max-w-[20em] py-3 ps-3 pe-5.5 flex items-center gap-3 bg-white rounded-2xl [&_svg]:shrink-0 text-pretty",
);
