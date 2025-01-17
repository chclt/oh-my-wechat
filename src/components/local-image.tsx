import type { RecordVM } from "@/components/record/record.tsx";
import _global from "@/lib/global.ts";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import type { Chat, MessageVM, PhotpSize } from "@/lib/schema.ts";
import type React from "react";
import { forwardRef, useEffect, useRef } from "react";

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
    const { registerIntersectionObserver } = useApp();

    const internalRef = useRef<HTMLImageElement>(null);
    const imgRef = (ref as React.RefObject<HTMLImageElement>) || internalRef;

    const [query, isQuerying, result, error] = useQuery<PhotpSize[]>([]);

    useEffect(() => {
      if (imgRef.current) {
        registerIntersectionObserver(imgRef.current, () => {
          query("/images", {
            chat,
            message,
            record,
            size,
            domain,
          });
        });
      }
    }, [imgRef]);

    useEffect(() => {
      return () => {
        if (result.length)
          result.map((photo) => {
            if (_global.enableDebug) console.log("revoke image", photo.src);
            URL.revokeObjectURL(photo.src);
          });
      };
    });

    return (
      <img
        ref={imgRef}
        src={result?.[0]?.src}
        width={result?.[0]?.width}
        height={result?.[0]?.height}
        alt={alt}
        loading="lazy"
        className={className}
        {...props}
      />
    );
  },
);

export default LocalImage;
