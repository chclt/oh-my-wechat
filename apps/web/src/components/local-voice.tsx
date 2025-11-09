import { VoiceSuspenseQueryOptions } from "@/lib/fetchers";
import type { ChatType, VoiceMessageType } from "@/schema";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type React from "react";

interface LocalVoiceProps extends React.ImgHTMLAttributes<HTMLAudioElement> {
	message: VoiceMessageType;
}

export default function LocalVoice({ message, ...props }: LocalVoiceProps) {
	const { ref: voiceRef, inViewport } = useInViewport();

	const { data } = useQuery({
		...VoiceSuspenseQueryOptions({
			message,
			scope: "transcription",
		}),
		enabled: inViewport,
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
}
