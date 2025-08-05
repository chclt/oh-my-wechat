import Image from "@/components/image.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { User as UserVM } from "@/lib/schema.ts";
import { format } from "date-fns";
import type React from "react";

import footer_logo from "/images/wrapped-2024/footer-logo.svg?url";
import { Route } from "@/routes/$accountId/route";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account";

export default function SectionNewUserAdded({
  data,
}: {
  data: {
    user_dates_contact_added: { user: UserVM; date: string }[];
  };
}) {
  const { accountId } = Route.useParams();
  const { data: account } = useSuspenseQuery(
    AccountSuspenseQueryOptions(accountId),
  );

  return (
    <section
      className="p-8 h-[812px] flex flex-col gap-4"
      style={{
        background:
          "radial-gradient(66.67% 50% at 0% 100%, rgba(164, 253, 176, 0.5) 0%, rgba(255, 255, 255, 0) 100%), " +
          "#FAFAFA",
      }}
    >
      <div className={"h-40 -translate-y-0.5"}>
        <h2 className={"text-[2rem] font-medium text-black/90"}>新朋友们</h2>
        <p className={"text-[28px] text-black/55"}>
          过去一年，你认识了 {data.user_dates_contact_added.length}{" "}
          位新好友，还记得你们的第一个话题吗{" "}
        </p>
      </div>
      <div className={"grow"}>
        <ScrollArea className={"h-[512px]"}>
          <ul className={"grid grid-cols-6 gap-4"}>
            {data.user_dates_contact_added.map((i) => (
              <li key={i.user.id} className={"flex flex-col items-center"}>
                <div
                  className={
                    "relative w-full before:content-[''] before:block before:pb-[100%] "
                  }
                >
                  <User.Photo
                    user={i.user}
                    variant={"default"}
                    className={"absolute inset-0 size-full"}
                  />
                </div>
                <h4 className={"mt-2 px-1 font-medium line-clamp-1"}>
                  {<User.Username user={i.user} variant={"default"} />}
                </h4>
                <span className={"text-xs text-black/45"}>
                  {format(new Date(i.date), "MM月dd日")}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
      <div className={"h-11 flex justify-end"}>
        <div className={"flex gap-2"}>
          <Image
            src={footer_logo}
            alt={"访问ohmywechat.com，查看微信报告2024"}
          />
          <User.Photo user={account} variant={"default"} />
        </div>
      </div>
    </section>
  );
}
