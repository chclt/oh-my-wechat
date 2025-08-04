import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import type { FileInfo, PhotpSize, VideoInfo, VoiceInfo } from "../schema";
import { getDataAdapter } from "../adapter";
import type { ImageController } from "@/adapters/ios-backup/controllers/image";
import type { VideoController } from "@/adapters/ios-backup/controllers/video";
import type { VoiceController } from "@/adapters/ios-backup/controllers/voice";
import type { AttachController } from "@/adapters/ios-backup/controllers/attach";

export function ImageSuspenseQueryOptions(
  requestData: ImageController.GetInput[0],
): UseSuspenseQueryOptions<PhotpSize[]> {
  return {
    queryKey: ["images", requestData],
    queryFn: () =>
      getDataAdapter()
        ?.getImage(requestData)
        .then((res) => res),
  };
}

export function VideoSuspenseQueryOptions(
  requestData: VideoController.GetInput[0],
): UseSuspenseQueryOptions<VideoInfo> {
  return {
    queryKey: ["videos", requestData],
    queryFn: () =>
      getDataAdapter()
        ?.getVideo(requestData)
        .then((res) => res),
  };
}

export function VoiceSuspenseQueryOptions(
  requestData: VoiceController.GetInput[0],
): UseSuspenseQueryOptions<VoiceInfo> {
  return {
    queryKey: ["voices", requestData],
    queryFn: () =>
      getDataAdapter()
        .getVoice(requestData)
        .then((res) => res),
  };
}

export function AttacheSuspenseQueryOptions(
  requestData: AttachController.GetInput[0],
): UseSuspenseQueryOptions<FileInfo[]> {
  return {
    queryKey: ["attaches", requestData],
    queryFn: () =>
      getDataAdapter()
        .getAttache(requestData)
        .then((res) => res),
  };
}
