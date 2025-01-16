import Image from "@/components/image.tsx";
import type { MessageVM, RecordType } from "@/lib/schema.ts";
import type { RecordVM } from "./record";

interface LiveRecordProps extends React.HTMLAttributes<HTMLDivElement> {
  message: MessageVM;
  record: LiveRecordEntity;
  variant: "default" | string;
}

export interface LiveRecordEntity extends RecordVM {
  "@_datatype": RecordType.LIVE;
  datatitle: string;
  datadesc: string;
  finderLive: {
    liveFlagValue: string;
    headUrl: string;
    authIconUrl: string;
    chargeFlag: string;
    cellWidth: string;
    bizUsername: string;
    cellHeight: string;
    nickname: string;
    finderUsername: string;
    finderObjectID: string;
    finderNonceID: string;
    extFlag: string;
    liveSourceTypeStr: string;
    authIconTypeStr: string;
    authIconType: string;
    finderLiveStatus: string;
    bizNickname: string;
    media: {
      coverUrl: string;
      width: string;
      height: string;
    };
    bindType: string;
    liveStatus: string;
    desc: string;
    liveFlag: string;
    replayStatus: string;
    spamLiveExtFlagString: string;
    finderLiveID: string;
  };
}

export default function LiveRecord({
  message,
  record,
  variant = "default",
  className,
  ...props
}: LiveRecordProps) {
  if (variant === "default")
    return (
      <div
        className="relative w-48 min-h-16 rounded-lg overflow-hidden bg-neutral-400"
        {...props}
      >
        <Image src={record.finderLive.media.coverUrl} alt="" />
        <div className="absolute right-0 left-0 bottom-0 p-2 flex items-center text-sm text-white">
          <Image
            src={record.finderLive.headUrl}
            className="mr-1 shrink-0 size-4 rounded-full bg-neutral-500"
          />
          <h4>{record.finderLive.nickname}</h4>
          {/*<p>{record.finderFeed.desc}</p>*/}
        </div>

        <div className="absolute right-2 bottom-2 size-4 p-0.5 [&_svg]:size-full rounded-full backdrop-blur">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M39.8207 7.5542C40.8629 8.04531 41.6463 9.00373 42.1545 10.2759C42.8451 12.0044 42.925 14.7809 42.6601 17.8351C42.3913 20.9335 41.7527 24.4637 40.896 27.7927C40.0404 31.1171 38.958 34.2775 37.788 36.6242C37.2048 37.7941 36.5816 38.7991 35.9284 39.5238C35.2958 40.2255 34.5112 40.8003 33.6017 40.8003C32.6381 40.8003 31.7406 40.3973 30.8957 39.7573C30.0539 39.1197 29.2121 38.2079 28.3415 37.0928C27.5507 36.0797 26.7322 34.8813 25.8973 33.5407C25.2486 32.499 24.6118 31.4074 24 30.3038C23.3881 31.4076 22.7514 32.4993 22.1028 33.5407C21.2679 34.8813 20.4494 36.0797 19.6586 37.0928C18.788 38.2079 17.9462 39.1197 17.1044 39.7573C16.2594 40.3973 15.362 40.8003 14.3984 40.8003C13.4889 40.8003 12.7043 40.2255 12.0717 39.5238C11.4185 38.7991 10.7953 37.7941 10.2121 36.6242C9.04213 34.2775 7.95969 31.1172 7.10413 27.7928C6.24738 24.4637 5.60874 20.9335 5.34001 17.8352C5.07511 14.781 5.15496 12.0045 5.84558 10.276L5.95089 10.0258C6.45941 8.87809 7.20667 8.01259 8.17942 7.55421C9.23151 7.05845 10.4199 7.09896 11.6049 7.57832C13.2798 8.25584 15.0248 9.8213 16.8742 11.9941C17.9876 13.3021 19.1455 14.8429 20.3308 16.5646C21.596 18.4024 22.8345 20.36 24 22.3186C24.9238 20.7663 25.8932 19.2149 26.8854 17.7234L26.8888 17.7181L27.6693 16.5646C28.8546 14.8428 30.0125 13.3021 31.1258 11.9941C32.9753 9.8213 34.7203 8.25584 36.3952 7.57832C37.5802 7.09896 38.7686 7.05845 39.8207 7.5542ZM38.2061 11.0322C38.1742 11.0298 38.0742 11.0364 37.8459 11.1288C36.9795 11.4792 35.6756 12.5789 34.0648 14.4713C33.051 15.6624 31.9707 17.0982 30.8467 18.7308C29.8421 20.19 28.8492 21.7373 27.8959 23.3045L27.8942 23.3074L26.8885 24.9926L26.1798 26.2239L26.2952 26.4471L26.2982 26.4529L26.726 27.2642L26.7269 27.266C27.5045 28.7218 28.3316 30.1736 29.1712 31.5217C29.9477 32.7687 30.691 33.8549 31.3832 34.7415C32.0031 35.5357 32.5578 36.1282 32.9989 36.5133C33.1826 36.6737 33.3361 36.7888 33.4573 36.8661C33.5233 36.7754 33.6025 36.6552 33.6939 36.5015C33.9948 35.9952 34.3643 35.2338 34.7681 34.2596C35.5727 32.3185 36.4807 29.6123 37.2267 26.595L37.5324 25.3093C38.2347 22.2322 38.6957 19.2923 38.8749 16.8658C38.9646 15.6518 38.9828 14.5782 38.9286 13.6868C38.8736 12.7832 38.7467 12.1181 38.5764 11.6919C38.4723 11.4312 38.3831 11.2611 38.3087 11.1521C38.2545 11.0728 38.2189 11.0419 38.2061 11.0322ZM13.935 14.4713C12.3242 12.5789 11.0203 11.4792 10.154 11.1288C9.92562 11.0364 9.82565 11.0298 9.79374 11.0322C9.78093 11.0419 9.74538 11.0728 9.69114 11.1521C9.61669 11.2611 9.52748 11.4313 9.42332 11.6921C9.35353 11.8668 9.29253 12.0764 9.24097 12.3193L9.20483 12.5042C9.04027 13.4158 8.99392 14.727 9.09195 16.3724C9.22239 18.5616 9.59911 21.22 10.1908 24.0452L10.4682 25.3128L10.7731 26.595C11.5191 29.6123 12.4271 32.3184 13.2317 34.2596C13.6355 35.2338 14.005 35.9952 14.3059 36.5015C14.3973 36.6552 14.4765 36.7754 14.5425 36.8661C14.6637 36.7888 14.8172 36.6737 15.0009 36.5134C15.442 36.1282 15.9967 35.5357 16.6167 34.7415C17.3088 33.8549 18.0521 32.7687 18.8287 31.5217C19.4578 30.5114 20.0802 29.4426 20.6801 28.3572L21.4078 27.0124L21.8184 26.2215L21.3941 25.4785L20.8128 24.4856L20.8117 24.4839C19.6472 22.5178 18.4093 20.5555 17.1531 18.7308C16.7785 18.1866 16.4087 17.6642 16.0446 17.1656L15.8638 16.9212L15.6824 16.6748C15.082 15.8703 14.4982 15.133 13.935 14.4713Z"
              fill="white"
              fillOpacity="0.55"
            />
          </svg>
        </div>
      </div>
    );
  return <p>[直播] {record.datatitle}</p>;
}
