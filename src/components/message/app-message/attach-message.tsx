import type { AppMessageProps } from "@/components/message/app-message.tsx";
import type { AppMessageType, FileInfo } from "@/lib/schema.ts";

import { FileBendSolid } from "@/components/central-icon.tsx";
import FileTypeIcon from "@/components/filetype-icon.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import { useEffect } from "react";

export interface AttachMessageEntity {
  type: AppMessageType.ATTACH;
  title: string;
  des: string;
  appattach: {
    totallen: number | number[];
    fileext: string;
    attachid: string;
    cdnattachurl: string;
    cdnthumbaeskey: string;
    aeskey: string;
    encryver: number;
    filekey: `${string}_${string}_${string}`;
    overwrite_newmsgid: string;
    fileuploadtoken: string;
  };
  md5: string;
  recorditem: string;
  uploadpercent: number;
  "@_appid": string;
  "@_sdkver": string;
}

type AttachMessageProps = AppMessageProps<AttachMessageEntity>;

export default function AttachMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: AttachMessageProps) {
  const { chat } = useApp();
  const [query, isQuerying, result, error] = useQuery<FileInfo[] | undefined>(
    undefined,
  );

  useEffect(() => {
    if (result && result.length) {
      const downlaodLink = document.createElement("a");
      downlaodLink.href = result[0].src;
      downlaodLink.download = decodeUnicodeReferences(
        message.message_entity.msg.appmsg.title,
      );
      downlaodLink.click();
    }
  }, [result]);

  useEffect(() => {
    return () => {
      if (result?.length)
        result.map((file) => {
          console.log("revoke attach", file.src);
          URL.revokeObjectURL(file.src);
        });
    };
  });

  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className={cn(
            "file-type-icon_trigger",
            "max-w-80 py-2.5 pr-2 pl-4 flex items-start bg-white space-x-2.5 rounded-xl cursor-pointer",
          )}
          {...props}
          onClick={() => {
            query("/attaches", { chat, message });
          }}
        >
          <div>
            <h4 className="break-words font-medium">
              {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
            </h4>
            <small className={"text-neutral-500"}>
              {(
                Math.round(
                  ((Array.isArray(
                    message.message_entity.msg.appmsg.appattach.totallen,
                  )
                    ? message.message_entity.msg.appmsg.appattach.totallen[0]
                    : message.message_entity.msg.appmsg.appattach.totallen) /
                    1024 /
                    1024) *
                    100,
                ) / 100
              ).toFixed(2)}
              MB
            </small>
          </div>

          {/*<img src={filetype_any} alt={"文件"} />*/}
          <FileTypeIcon className="shrink-0" />
        </div>
      </DefaultMessageWithUser>
    );
  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      <span className="-ml-1 relative inline-block size-[1.5em] align-bottom text-black/45 [&_svg]:inline [&_svg]:absolute [&_svg]:inset-0 [&_svg]:m-auto [&_svg]:size-[1.25em] [&_svg]:rounded-[3px] me-[0.15em]">
        <FileBendSolid />
      </span>
      [文件] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
    </p>
  );
}
