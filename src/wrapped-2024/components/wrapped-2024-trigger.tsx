import {
  CelebrateSolid,
  ChevronRightSmallLine,
} from "@/components/central-icon.tsx";
import Wrapped2024 from "./wrapped-2024.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { useState } from "react";

export default function Wrapped2024Trigger() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <div
        className={
          "relative w-[320px] border-border/50 rounded-3xl shadow-none border bg-card text-card-foreground"
        }
        style={{
          background:
            "radial-gradient(66.67% 50% at 0% 100%, rgba(164, 253, 176, 0.5) 0%, rgba(255, 255, 255, 0) 100%)",
        }}
      >
        <div className={"flex flex-col items-start space-y-1.5 p-6"}>
          <div
            className={
              "font-semibold leading-none tracking-tight flex flex-col items-start gap-2 text-black/90"
            }
          >
            <CelebrateSolid className={"size-6"} />
            2024 微信年度报告现已上线
          </div>
          <div className={"text-sm text-muted-foreground"}>回顾你的 2024</div>
        </div>
        <div className={"h-16 p-6 pt-0"}>
          <DialogTrigger
            onClick={() => {
              setIsOpen(true);
            }}
          >
            <Button
              variant="outline"
              className={
                "group absolute inset-0 py-6 pl-6 pr-5 h-auto gap-1.5 font-medium justify-end items-end border-none bg-transparent hover:bg-transparent shadow-none rounded-3xl"
              }
            >
              <div
                className={
                  "inline-flex items-center gap-1 [&_svg]:size-6 [&_svg]:translate-x-0 group-hover:[&_svg]:translate-x-0.5 group-hover:[&_svg]:transition-transform"
                }
              >
                开始
                <ChevronRightSmallLine />
              </div>
            </Button>
          </DialogTrigger>
        </div>
      </div>

      <DialogContent
        className={
          "max-w-none w-full h-full p-0 flex justify-center bg-white border-none shadow-none"
        }
      >
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>微信报告2024</DialogTitle>
            <DialogDescription>微信报告2024</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        <Wrapped2024
          startTime={new Date("2024/1/1")}
          endTime={new Date("2025/1/1")}
        />

        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
