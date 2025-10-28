import { cn } from "@/lib/utils";

export const MiniRoutePageOverlayClassName = cn(
	"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:ease-out",
	"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:ease-out",
	"fill-mode-forwards duration-200",
);

export const MiniRoutePageContentClassName = cn(
	"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-end-40 data-[state=open]:ease-out",
	"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-end-40 data-[state=closed]:ease-out",
	"fill-mode-forwards duration-200",
);

export const MiniRouteFirstPageContentClassName = cn(
	"has-[+[data-state=closed]]:translate-x-0 has-[+[data-state=closed]]:ease-out",
	"has-[+[data-state=open]]:-translate-x-[min(100%,40rem)] has-[+[data-state=open]]:ease-out",
	"transition-transform duration-200",
);
