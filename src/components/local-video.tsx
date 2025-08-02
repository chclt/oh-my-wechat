import _global from "@/lib/global.ts";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import { useQuery } from "@tanstack/react-query";
import type {
  Chat,
  MicroVideoMessage,
  VideoInfo,
  VideoMessage,
} from "@/lib/schema.ts";
import type React from "react";
import { forwardRef, useEffect, useRef } from "react";
import { VideoSuspenseQueryOptions } from "@/lib/fetchers";
import { useInViewport } from "@mantine/hooks";

interface LocalVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  chat: Chat;
  message: VideoMessage | MicroVideoMessage;
}

const LocalVideo = forwardRef<HTMLVideoElement, LocalVideoProps>(
  ({ chat, message, ...props }, ref) => {
    const { ref: videoRef, inViewport } = useInViewport();

    const { data } = useQuery({
      ...VideoSuspenseQueryOptions({
        chat,
        message,
      }),
      enabled: inViewport,
    });

    useEffect(() => {
      return () => {
        if (data?.poster) {
          if (_global.enableDebug)
            console.log("revoke video poster", data.poster);
          URL.revokeObjectURL(data.poster);
        }
        if (data?.src) {
          if (_global.enableDebug) console.log("revoke video", data.src);
          URL.revokeObjectURL(data.src);
        }
      };
    });

    return (
      <video
        ref={videoRef}
        src={data?.src}
        poster={data?.poster}
        controls
        // width={result?.[0]?.width}
        // height={result?.[0]?.height}
        {...props}
      />
    );
  },
);

export default LocalVideo;
