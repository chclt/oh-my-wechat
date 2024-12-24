import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type * as React from "react";
import { ArrowShareRightSolid } from "./central-icon";
import Link from "./link";

const LinkCardTitleVariants = cva("font-medium text-pretty line-clamp-3");
const LinkCardAbstractVariants = cva(
  "mt-1 text-pretty line-clamp-5 text-neutral-500",
);
const LinkCardPreviewImageVariants = cva("float-end ms-2 h-12 w-auto rounded");
const LinkCardFooterVariants = cva(
  "px-3 py-1.5 text-sm leading-normal text-neutral-500 border-t border-neutral-200",
);
const LinkCardIconVariants = cva(
  "float-end mt-[3px] mb-[4px] ms-1 size-3.5 [&_svg]:size-full text-[#D9D9D9]",
);

export interface LinkCardProps
  extends React.AnchorHTMLAttributes<HTMLDivElement> {
  heading?: string;
  abstract?: string;
  preview?: React.ReactElement<HTMLImageElement>;
  from?: string;
  icon?: React.ReactNode;
}

const LinkCard = ({
  href,
  heading,
  abstract,
  preview,
  from,
  icon,
  ...props
}: LinkCardProps) => {
  return (
    <Link href={href}>
      <div
        className={cn(
          "relative max-w-[20em] flex flex-col rounded-lg bg-white",
        )}
        {...props}
      >
        <div className="p-3">
          <h4 className={cn(LinkCardTitleVariants())}>{heading}</h4>
          <div className={cn(LinkCardAbstractVariants())}>
            {preview && (
              <Slot className={cn(LinkCardPreviewImageVariants())}>
                {preview}
              </Slot>
            )}

            {abstract}
          </div>
        </div>

        <div className={cn(LinkCardFooterVariants())}>
          {from}
          {icon ? (
            <Slot className={cn(LinkCardIconVariants())}>{icon}</Slot>
          ) : (
            <div className={cn(LinkCardIconVariants())}>
              <ArrowShareRightSolid />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export { LinkCard };
