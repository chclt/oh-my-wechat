import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-lg bg-card", className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("font-medium text-pretty line-clamp-3", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-3", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-3 py-1.5 min-h-[em] text-sm leading-normal text-muted-foreground border-t",
        className,
      )}
      {...props}
    />
  );
}

function CardIndicator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "float-end mt-[3px] mb-[4px] ms-1 size-3.5 [&_svg]:size-full text-muted-foreground/55",
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardContent, CardIndicator };
