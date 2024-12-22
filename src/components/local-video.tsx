import { useApp } from "@/lib/hooks/appProvider.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import type {
  Chat,
  MicroVideoMessage,
  VideoInfo,
  VideoMessage,
} from "@/lib/schema.ts";
import type React from "react";
import { forwardRef, useEffect, useRef } from "react";

interface LocalVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  chat: Chat;
  message: VideoMessage | MicroVideoMessage;
}

const LocalVideo = forwardRef<HTMLVideoElement, LocalVideoProps>(
  ({ chat, message, ...props }, ref) => {
    const { registerIntersectionObserver } = useApp();

    const internalRef = useRef<HTMLVideoElement>(null);
    const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalRef;

    const [query, isQuerying, result, error] = useQuery<VideoInfo | undefined>(
      undefined,
    );

    useEffect(() => {
      if (videoRef.current) {
        registerIntersectionObserver(videoRef.current, () => {
          query("/videos", {
            chat,
            message,
          });
        });
      }
    }, [videoRef]);

    useEffect(() => {
      return () => {
        if (result?.poster) {
          console.log("revoke video poster", result.poster);
          URL.revokeObjectURL(result.poster);
        }
        if (result?.src) {
          console.log("revoke video", result.src);
          URL.revokeObjectURL(result.src);
        }
      };
    });

    return (
      <video
        ref={videoRef}
        src={result?.src}
        poster={result?.poster}
        controls
        // width={result?.[0]?.width}
        // height={result?.[0]?.height}
        {...props}
      />
    );
  },
);

export default LocalVideo;
