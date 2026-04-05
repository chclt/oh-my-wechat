import { useInViewport } from "@mantine/hooks";
import { ImageInfo, ImageMessageType } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useAccount } from "@/components/account-provider.tsx";
import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { cn } from "@/lib/utils.ts";
import { useChatMediaCarouselContext } from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/chat-media-carousel-context.tsx";
import type { ImageMessageProps } from "./types.ts";

export function ImageMessageDefault({ message, ...props }: ImageMessageProps) {
  const { accountId } = useAccount();

  const { ref: imageRef, inViewport } = useInViewport();

  const { data: image } = useQuery({
    ...MessageImageQueryOptions({
      account: { id: accountId },
      chat: { id: message.chat_id },
      message,
    }),
    enabled: inViewport,
  });

  return (
    <div className={cn("rounded-lg overflow-hidden")} {...props}>
      <ErrorBoundary
        fallback={
          <AutoResolutionFallbackImage
            ref={imageRef}
            image={image}
            className={
              "max-w-[16em] max-h-128 min-w-32 min-h-16 object-contain bg-white"
            }
          />
        }
      >
        <ImageMessageCarouselTrigger
          ref={imageRef}
          message={message}
          image={image}
          className={
            "max-w-[16em] max-h-128 min-w-32 min-h-16 object-contain bg-white"
          }
        />
      </ErrorBoundary>
    </div>
  );
}

function ImageMessageCarouselTrigger({
  message,
  image,
  ref,
  ...props
}: {
  message: Pick<ImageMessageType, "date">;
  image?: ImageInfo | null;
  ref?: React.Ref<HTMLImageElement>;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const { openChatMediaCarousel } = useChatMediaCarouselContext();

  return (
    <AutoResolutionFallbackImage
      ref={ref}
      image={image}
      {...props}
      onClick={() => {
        // TODO: Refactor
        openChatMediaCarousel(message);
      }}
    />
  );
}
