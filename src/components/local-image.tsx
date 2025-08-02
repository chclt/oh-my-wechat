import type { RecordVM } from "@/components/record/record.tsx";
import _global from "@/lib/global.ts";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import { useQuery } from "@tanstack/react-query";
import type { Chat, MessageVM, PhotpSize } from "@/lib/schema.ts";
import type React from "react";
import { forwardRef, useEffect, useRef } from "react";
import { useInViewport } from "@mantine/hooks";
import { ImageSuspenseQueryOptions } from "@/lib/fetchers";

type LocalImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  chat: Chat;
  message: MessageVM;
  record?: RecordVM;
  size?: "origin" | "thumb"; // 期望的尺寸，可能因为没有指定尺寸而使用另一尺寸
  domain?: "image" | "opendata" | "video"; // 图片资源默认从 Img 文件夹获取，如果消息里有 appattach 字段，图片在 OpenData 文件夹，如果是视频，缩略图会和视频一样在 Video 文件夹
};

const LocalImage = forwardRef<HTMLImageElement, LocalImageProps>(
  (
    {
      chat,
      message,
      record,
      size = "origin",
      domain = "image",
      alt,
      className,
      ...props
    },
    ref,
  ) => {
    const { ref: imgRef, inViewport } = useInViewport();

    const { data } = useQuery({
      ...ImageSuspenseQueryOptions({
        chat,
        message,
        record,
        size,
        domain,
      }),
      initialData: [],
      enabled: inViewport,
    });

    useEffect(() => {
      return () => {
        if (data.length)
          data.map((photo) => {
            URL.revokeObjectURL(photo.src);
          });
      };
    });

    return (
      <img
        ref={imgRef}
        src={data?.[0]?.src}
        width={data?.[0]?.width}
        height={data?.[0]?.height}
        alt={alt}
        loading="lazy"
        className={className}
        {...props}
      />
    );
  },
);

export default LocalImage;
