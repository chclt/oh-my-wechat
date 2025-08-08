import Image from "@/components/image.tsx";
import WechatEmojiTable from "@/lib/wechat-emojis.ts";

export default function WechatEmoji({ emojiName }: { emojiName: string }) {
	return (
		<span
			className={
				"relative inline-block size-[1.5em] align-top [&_img]:inline [&_img]:absolute [&_img]:inset-0 [&_img]:m-auto [&_img]:size-[1.25em] [&_img]:rounded-[3px]"
			}
		>
			<Image
				src={`/wxemoji/${WechatEmojiTable[emojiName]}`}
				alt={emojiName}
				draggable={false}
			/>
		</span>
	);
}
