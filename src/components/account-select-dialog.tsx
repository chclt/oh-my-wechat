import {
  ChevronRightSmallLine,
  CircleQuestionmarkLine,
  FolderOpenLine,
  TriangleExclamationLine,
} from "@/components/central-icon.tsx";
import Image from "@/components/image.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import { useDatabase } from "@/lib/hooks/databaseProvider.tsx";
import type { User } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import type { DialogProps } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function AccountSelectDialog(props: DialogProps) {
  const { loadDirectory, loadDatabases, accountList } = useDatabase();
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const { setUser } = useApp();
  const [accountSelected, setAccountSelected] = useState<User>(accountList[0]);

  const isFSAEnabled = "showOpenFilePicker" in window;

  useEffect(() => {
    if (accountList.length === 1) {
      loadDatabases(accountList[0]);
      setUser(accountList[0]);
    }
  }, [accountList]);

  return (
    <Dialog {...props}>
      <DialogContent className={"justify-items-center"}>
        <VisuallyHidden>
          <DialogTitle>打开备份</DialogTitle>
          <DialogDescription>打开 iTunes 备份文件夹</DialogDescription>
        </VisuallyHidden>

        {isFSAEnabled && !accountList.length && (
          <Button
            variant="outline"
            className="w-fit h-auto px-5 py-3 flex flex-col gap-3 text-base text-foreground [&_svg]:size-8 rounded-xl shadow-none"
            onClick={async () => {
              if ("showOpenFilePicker" in window) {
                const directoryHandle = await window.showDirectoryPicker();
                if ((await directoryHandle.requestPermission()) === "granted") {
                  loadDirectory(directoryHandle);
                }
              }
            }}
          >
            <FolderOpenLine />
            打开备份文件夹
          </Button>
        )}

        {!isFSAEnabled && !accountList.length && (
          <label className={"relative"}>
            <input
              type={"file"}
              // @ts-ignore
              webkitdirectory=""
              className={"peer absolute bottom-0 start-0"}
              disabled={isLoadingDirectory}
              onChange={(event) => {
                if (event.target.files && event.target.files.length > 0) {
                  setIsLoadingDirectory(true);
                  loadDirectory(event.target.files);
                  event.target.files === null;
                } else {
                  setIsLoadingDirectory(false);
                  event.target.files === null;
                }
              }}
              hidden
            />
            <div
              className={cn(
                "whitespace-nowrap rounded-xl text-base font-medium transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-1 peer-focus-visible:ring-ring peer-disabled:pointer-events-none peer-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-8 [&_svg]:shrink-0",
                "w-fit h-auto px-5 py-3 flex flex-col items-center justify-center gap-3  text-foreground  border border-input bg-background shadow-none hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {isLoadingDirectory ? (
                <LoaderIcon className={"animate-spin"} />
              ) : (
                <FolderOpenLine className={""} />
              )}
              选择备份文件夹
            </div>
          </label>
        )}
        {!!accountList.length && (
          <div className={"justify-self-stretch space-y-4 flex flex-col"}>
            <div
              className={cn(
                "relative flex gap-3 text-black/45 before:content-[''] before:shrink-0 before:mt-0.5 before:size-5 before:rounded-full before:bg-black/25 ",
                "after:content-[''] after:block after:absolute after:left-2.5 after:top-[1.625rem] after:h-3 after:border-l after:border-black/25 ",
              )}
            >
              <div>
                <p className={"text-black/45"}>已打开 iTunes 备份</p>
              </div>
            </div>

            <div
              className={
                "flex gap-3 text-foreground before:content-[''] before:shrink-0 before:mt-0.5 before:size-5 before:rounded-full before:bg-foreground"
              }
            >
              <div>
                <p>选择账号</p>
                <p className={"text-sm text-black/45"}>
                  在备份中找到 {accountList.length} 个账号
                </p>
              </div>
            </div>

            <RadioGroup
              className={"flex flex-wrap gap-4"}
              onValueChange={(accountId) => {
                const account = accountList.find(
                  (account) => account.id === accountId,
                );
                if (account) setAccountSelected(account);
              }}
            >
              {accountList.map((account) => (
                <div
                  key={account.id}
                  className="grow basis-40 relative after:content-[''] after:block after:w-full after:pb-[62.5%]"
                >
                  <RadioGroupItem
                    value={account.id}
                    id={account.id}
                    className={"peer z-20 absolute bottom-2 right-2"}
                  />
                  <Label
                    htmlFor={account.id}
                    className={
                      "z-10 absolute size-full pt-4 pb-3 px-5 flex flex-col justify-center items-center gap-2.5 hover:bg-accent rounded-xl border border-input peer-data-[state=checked]:border-primary"
                    }
                  >
                    <div
                      className={
                        "relative min-w-11 w-[27.5%] after:content-[''] after:block after:w-full after:pb-[100%]"

                        // className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      }
                    >
                      <Image
                        src={account.photo?.thumb}
                        alt={account.username}
                        className={
                          "absolute inset-0 size-full clothoid-corner-[18.18%]"
                        }
                      />
                    </div>
                    {account.username}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              variant="outline"
              className={
                "self-end w-fit h-auto py-1.5 pl-[1.125rem] pr-1.5 flex items-center gap-1 [&_svg]:size-6 text-base rounded-xl shadow-none"
              }
              disabled={!accountSelected}
              onClick={() => {
                if (accountSelected) {
                  loadDatabases(accountSelected);
                  setUser(accountSelected);
                }
              }}
            >
              打开
              <ChevronRightSmallLine />
            </Button>
          </div>
        )}

        <p className={"flex items-center text-sm text-black/45"}>
          <span className={"mr-1 shrink-0 size-[1.125rem] [&_svg]:size-full"}>
            <CircleQuestionmarkLine className={"inline"} />
          </span>
          遇到问题？查看使用教程
        </p>

        <p className={"flex items-center text-sm text-black/45"}>
          <span
            className={
              "mr-1 shrink-0 size-[1.125rem] [&_svg]:size-full relative top-px"
            }
          >
            <TriangleExclamationLine className={"inline"} />
          </span>
          为了防止浏览器插件造成的隐私泄露，建议使用使用无痕模式打开
        </p>
      </DialogContent>
    </Dialog>
  );
}
