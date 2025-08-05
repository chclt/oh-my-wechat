import {
  ChatIconFill,
  ChatIconOutline,
  ContactIconFill,
  ContactIconOutline,
} from "@/components/icon";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chat } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/$accountId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { accountId } = Route.useParams();

  return (
    <div className="h-full flex items-stretch">
      <aside className={"flex flex-col justify-between border-r"}>
        <div className="flex flex-col">
          <Link
            to="/$accountId/chat"
            params={{ accountId }}
            className={cn(
              "w-16 h-16 p-0 flex flex-col items-center justify-center text-sm ",
              "group [&.active]:text-[#03C160] rounded-none after:content-none hover:bg-neutral-100",
            )}
          >
            <div className="mt-1 w-8 h-8">
              <ChatIconOutline
                className={"group-[&.active]:hidden size-full"}
              />
              <ChatIconFill
                className={"hidden group-[&.active]:block size-full"}
              />
            </div>
            <span className="mt-0.5 text-xs">消息</span>
          </Link>

          {/* <button
            type="button"
            className={cn(
              "w-16 h-16 p-0 flex flex-col items-center justify-center text-sm ",
              "group hover:text-[#03C160] rounded-none after:content-none hover:bg-neutral-100",
            )}
          >
            <div className="mt-1 w-8 h-8">
              <ContactIconOutline className={"group-hover:hidden size-full"} />
              <ContactIconFill
                className={"hidden group-hover:block size-full"}
              />
            </div>
            <span className="mt-0.5 text-xs">通讯录</span>
          </button> */}
        </div>
      </aside>

      <Outlet />
    </div>
  );
}
