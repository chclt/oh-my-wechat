import {
  Card,
  CardContent,
  CardFooter,
  CardIndicator,
  CardTitle,
} from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import type * as React from "react";
import { ArrowShareRightSolid } from "./central-icon";
import Link from "./link";

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
      <Card className={cn("max-w-[20em]")} {...props}>
        <CardContent className="p-3">
          <CardTitle>{heading}</CardTitle>
          <div
            className={cn(
              "mt-1 text-pretty line-clamp-5 text-muted-foreground",
            )}
          >
            {preview && (
              <Slot className={"float-end ms-2 h-12 w-auto rounded"}>
                {preview}
              </Slot>
            )}

            {abstract}
          </div>
        </CardContent>

        <CardFooter>
          {from && from.length > 0 ? from : "\u200B"}

          <CardIndicator>
            <ArrowShareRightSolid />
          </CardIndicator>
        </CardFooter>
      </Card>
    </Link>
  );
};

export { LinkCard };
