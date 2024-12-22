import ImageMessage from "@/components/message/image-message.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import VideoMessage from "@/components/message/video-message.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import {
  type Chat,
  type ControllerPaginatorResult,
  type ImageMessage as ImageMessageVM,
  MessageType,
  type VideoMessage as VideoMessageVM,
} from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import type { DialogProps } from "@radix-ui/react-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface MediaViewerDialog extends DialogProps {
  chat: Chat;
}

export default function MediaViewerDialog({
  chat,
  ...props
}: MediaViewerDialog) {
  const [messageList, setMessageList] = useState<{
    [key: number]: (ImageMessageVM | VideoMessageVM)[];
  }>({});
  const [query, isQuerying, result, error] = useQuery<
    ControllerPaginatorResult<(ImageMessageVM | VideoMessageVM)[]>
  >({
    data: [],
    meta: {},
  });

  const paginatorCursor = useRef<number>();

  useEffect(() => {
    paginatorCursor.current = Date.now();
    setMessageList({});
    query("/messages", {
      chat,
      type: [MessageType.IMAGE, MessageType.VIDEO],
      cursor: paginatorCursor.current,
    });
  }, [chat]);

  useEffect(() => {
    paginatorCursor.current = result.meta.next_cursor;
    if (result.meta.cursor) {
      setMessageList((old) => ({
        // @ts-ignore TODO
        [result.meta.cursor]: result.data,
        ...old,
      }));
    }
  }, [result]);

  const [carouselMainApi, setCarouselMainApi] = useState<CarouselApi>();
  const [carouselThumbApi, setCarouselThumbApi] = useState<CarouselApi>();

  const onThumbClick = useCallback(
    (index: number) => {
      if (!carouselMainApi || !carouselThumbApi) return;
      carouselMainApi.scrollTo(index, true);
    },
    [carouselMainApi, carouselThumbApi],
  );

  return (
    <Dialog {...props}>
      <DialogPortal>
        <DialogOverlay className="bg-black/85" />
        <DialogPrimitive.Content
          className={cn(
            "dark fixed left-[50%] top-[50%] z-50 grid w-full h-full translate-x-[-50%] translate-y-[-50%] gap-4 bg-transparent text-foreground duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          )}
        >
          <VisuallyHidden>
            <DialogTitle>图片</DialogTitle>
          </VisuallyHidden>
          <div className={"flex flex-col overflow-hidden"}>
            <div className={"grow my-4"}>
              <Carousel
                className="w-full h-full [&>div]:h-full"
                setApi={setCarouselMainApi}
              >
                <CarouselContent className={"h-full"}>
                  {Object.keys(messageList)
                    .map(Number)
                    .sort((a, b) => b - a)
                    .flatMap((key) => messageList[key])
                    .map((message, index, messageArray) => (
                      <CarouselItem key={`${message.id}|${message.local_id}`}>
                        {message.type === MessageType.IMAGE && (
                          <ImageMessage
                            key={`${message.id}|${message.local_id}`}
                            variant="viewer_detail"
                            message={message}
                            showPhoto={false}
                            showUsername={false}
                            direction={message.direction}
                            className={
                              "w-full h-full relative [&>img]:absolute [&>img]:inset-0 [&>img]:m-auto [&>img]:max-w-full [&>img]:max-h-full [&>img]:aspect-auto"
                            }
                          />
                        )}
                        {message.type === MessageType.VIDEO && (
                          <VideoMessage
                            key={`${message.id}|${message.local_id}`}
                            variant="viewer_detail"
                            message={message}
                            showPhoto={false}
                            showUsername={false}
                            direction={message.direction}
                            className={
                              "w-full h-full relative [&>video]:absolute [&>video]:inset-0 [&>video]:m-auto [&>video]:max-w-full [&>video]:max-h-full [&>video]:aspect-auto"
                            }
                          />
                        )}
                      </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className={"left-4"} />
                <CarouselNext className={"right-4"} />
              </Carousel>
            </div>

            <div className={"h-24"}>
              <Carousel
                className="w-full h-full [&>div]:h-full"
                setApi={setCarouselThumbApi}
                opts={{ slidesToScroll: "auto", dragFree: true }}
              >
                <CarouselContent className={"h-full"}>
                  {Object.keys(messageList)
                    .map(Number)
                    .sort((a, b) => b - a)
                    .flatMap((key) => messageList[key])
                    .map((message, index) => (
                      <CarouselItem
                        key={`${message.id}|${message.local_id}`}
                        className="pl-1 basis-auto"
                        onClick={() => {
                          console.log(`${message.id}|${message.local_id}`);
                          onThumbClick(index);
                        }}
                      >
                        {message.type === MessageType.IMAGE && (
                          <ImageMessage
                            key={`${message.id}|${message.local_id}`}
                            variant="viewer_thumb"
                            message={message}
                            showPhoto={false}
                            showUsername={false}
                            direction={message.direction}
                            className={
                              "min-w-12 h-full [&_img]:mx-auto [&_img]:aspect-auto [&_img]:h-full [&_img]:w-auto "
                            }
                          />
                        )}

                        {message.type === MessageType.VIDEO && (
                          <VideoMessage
                            key={`${message.id}|${message.local_id}`}
                            variant="viewer_thumb"
                            message={message}
                            showPhoto={false}
                            showUsername={false}
                            direction={message.direction}
                            className={
                              "min-w-12 h-full [&_img]:mx-auto [&_img]:aspect-auto [&_img]:h-full [&_img]:w-auto "
                            }
                          />
                        )}
                      </CarouselItem>
                    ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
