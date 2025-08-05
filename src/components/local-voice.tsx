import { VoiceSuspenseQueryOptions } from "@/lib/fetchers";
import _global from "@/lib/global.ts";
import type { Chat, VoiceInfo, VoiceMessage } from "@/lib/schema.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { forwardRef, useEffect, useRef, useState } from "react";

interface LocalVoiceProps extends React.ImgHTMLAttributes<HTMLAudioElement> {
  chat: Chat;
  message: VoiceMessage;
}

const LocalVoice = forwardRef<HTMLAudioElement, LocalVoiceProps>(
  ({ chat, message, ...props }, ref) => {
    const { ref: voiceRef, inViewport } = useInViewport();
    const [hadBeenInViewport, setHadBeenInViewport] = useState(false);

    useEffect(() => {
      if (inViewport) {
        setHadBeenInViewport(true);
      }
    }, [inViewport]);

    const { data } = useQuery({
      ...VoiceSuspenseQueryOptions({
        chat,
        message,

        scope: "transcription",
      }),
      enabled: hadBeenInViewport,
    });

    return (
      <audio
        ref={voiceRef}
        src={data?.src}
        controls
        // width={result?.[0]?.width}
        // height={result?.[0]?.height}
        {...props}
      />
      // <div>
      //   {result && (
      //     <>
      //       {result.raw_aud_src && (
      //         <a
      //           href={result.raw_aud_src}
      //           download={`${chat.title}_${message.local_id}.aud`}
      //         >
      //           download aud
      //         </a>
      //       )}
      //       {result.transcription && <p>{result.transcription}</p>}
      //     </>
      //   )}
      // </div>
    );
  },
);

export default LocalVoice;
