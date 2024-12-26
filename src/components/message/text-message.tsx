import type { MessageProp } from "@/components/message/message.tsx";
import User from "@/components/user.tsx";
import WechatEmoji, { WechatEmojiTable } from "@/components/wechat-emoji.tsx";
import {
  MessageDirection,
  type TextMessage as TextMessageVM,
} from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import Link from "../link";
import MessageInlineWrapper from "./message-inline";

type TextMessageProps = MessageProp<TextMessageVM>;

export type TextMessageEntity = string;

export const textMessageVariants = cva(
  [
    "py-2.5 px-3 w-fit max-w-[20em] min-h-11 rounded-lg",
    "leading-normal break-words text-pretty",
    "[&>p]:min-h-[1.5em] [&_a]:text-blue-500 [&_a]:underline",
  ],
  {
    variants: {
      variant: {
        default: [],
        referenced: [],
      },
      direction: {
        [MessageDirection.outgoing]: ["bg-[#95EB69] bubble-tail-r"],
        [MessageDirection.incoming]: ["bg-white bubble-tail-l"],
      },
    },
  },
);

export default function TextMessage({
  message,
  variant = "default",
  className,
  ...props
}: TextMessageProps) {
  if (variant === "default") {
    return (
      <div
        className={cn(
          textMessageVariants({
            variant,
            direction: message.direction,
            className,
          }),
        )}
        {...props}
      >
        <FormatTextMessageContent text={message.message_entity} />
      </div>
    );
  }

  if (variant === "referenced") {
    return (
      <div className={"inline"}>
        <User user={message.from} variant={"inline"} />
        <span>: </span>
        <FormatTextMessageContent
          text={message.message_entity}
          className={"inline"}
        />
      </div>
    );
  }

  return (
    <MessageInlineWrapper message={message} className={className} {...props}>
      <FormatTextMessageContent
        text={message.message_entity}
        className={"inline"}
      />
    </MessageInlineWrapper>
  );
}

interface FormatTextMessageContentProps
  extends React.HTMLProps<HTMLParagraphElement> {
  text: string;
  variant?: "default" | "inline";
}

export function FormatTextMessageContent({
  text,
  variant = "default",
  className,
  ...props
}: FormatTextMessageContentProps) {
  const paragraphNodes = text.split("\n").map((paragraphString, index) => {
    // 微信表情
    let paragraphChildren = Object.keys(WechatEmojiTable).reduce<ReactNode[]>(
      (paragraphChildren, emojiKey) => {
        paragraphChildren.forEach(
          (segment, segmentIndex, paragraphChildren) => {
            if (typeof segment === "string") {
              const nodeChildren = segment
                .split(emojiKey)
                .reduce<ReactNode[]>((p, segment, index, segments) => {
                  p.push(segment);
                  if (index !== segments.length - 1) {
                    p.push(<WechatEmoji emojiName={emojiKey} />);
                  }
                  return p;
                }, []);

              paragraphChildren.splice(segmentIndex, 1, ...nodeChildren);
            }
          },
        );

        return paragraphChildren;
      },
      [paragraphString],
    );

    // Unicode 表情
    const unicodeEmojiRegex = /(\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F])/g;
    paragraphChildren = paragraphChildren.flatMap((segment) => {
      if (typeof segment === "string") {
        return segment.split(unicodeEmojiRegex).map((s) => {
          if (unicodeEmojiRegex.test(s)) {
            return (
              <span className="inline-block mx-[0.166em] scale-[110%]">
                {s}
              </span>
            );
          }
          return s;
        });
      }
      return segment;
    });

    // 在全半角字符之间添加空格，偏移出现在结尾的全角标点
    const isCJK = (char: string) => {
      const code = char.charCodeAt(0);
      return (
        (code >= 0x3000 && code <= 0x9fff) || (code >= 0xff00 && code <= 0xffef)
      );
    };

    const punctuation = [
      "。",
      "，",
      "！",
      "？",
      "；",
      "：",
      "）",
      "】",
      "」",
      "、",
      "》",
    ];
    paragraphChildren = paragraphChildren.flatMap((segment) => {
      if (typeof segment === "string") {
        return [...segment]
          .map((char, index, string) => {
            if (index === string.length - 1) {
              if (punctuation.includes(char)) {
                return <span className="inline-block -me-[0.4em]">{char}</span>;
              }
              return char;
            }

            const prevChar = index === 0 ? undefined : string[index - 1];
            const nextChar = string[index + 1];

            if (isCJK(char) && !isCJK(nextChar) && nextChar !== " ") {
              return <span className="me-[0.166em]">{char}</span>;
            }

            if (
              prevChar &&
              isCJK(char) &&
              !isCJK(prevChar) &&
              prevChar !== " "
            ) {
              return <span className="ms-[0.166em]">{char}</span>;
            }

            return char;
          })
          .reduce(
            (acc, cur) => {
              if (
                typeof acc[acc.length - 1] === "string" &&
                typeof cur === "string"
              ) {
                acc[acc.length - 1] += cur;
              } else {
                acc.push(cur);
              }
              return acc;
            },
            [] as (string | ReactNode)[],
          );
      }
      return segment;
    });

    // 链接
    const urlRegex =
      /((?:https?|ftp):\/\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=]+)/is;
    paragraphChildren = paragraphChildren.flatMap((segment, segmentIndex) => {
      if (typeof segment === "string") {
        return segment.split(urlRegex).map((s) => {
          if (urlRegex.test(s)) {
            return (
              <Link href={s} className="break-all text-blue-500 underline">
                {s}
              </Link>
            );
          }
          return s;
        });
      }
      return segment;
    });

    const Container = variant === "default" ? "p" : "span";

    return (
      <Container key={index} className={className} {...props}>
        {...paragraphChildren}
      </Container>
    );
  });

  return <>{...paragraphNodes}</>;
}
