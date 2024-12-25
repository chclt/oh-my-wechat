import { useApp } from "@/lib/hooks/appProvider.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import type { Chat, VoiceInfo, VoiceMessage } from "@/lib/schema.ts";
import type React from "react";
import { forwardRef, useEffect, useRef } from "react";

interface LocalVoiceProps extends React.ImgHTMLAttributes<HTMLAudioElement> {
  chat: Chat;
  message: VoiceMessage;
}

const LocalVoice = forwardRef<HTMLAudioElement, LocalVoiceProps>(
  ({ chat, message, ...props }, ref) => {
    const { registerIntersectionObserver } = useApp();

    const internalRef = useRef<HTMLAudioElement>(null);
    const voiceRef = (ref as React.RefObject<HTMLAudioElement>) || internalRef;

    const [query, isQuerying, result, error] = useQuery<VoiceInfo | undefined>(
      undefined,
    );

    useEffect(() => {
      if (voiceRef.current) {
        registerIntersectionObserver(voiceRef.current, () => {
          query("/voices", {
            chat,
            message,

            scope: "transcription",
          });
        });
      }
    }, [voiceRef]);

    useEffect(() => {
      return () => {
        if (result?.src) {
          console.log("revoke audio", result.src);
          URL.revokeObjectURL(result.src);
        }
      };
    });

    return (
      <audio
        ref={voiceRef}
        src={result?.src}
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
