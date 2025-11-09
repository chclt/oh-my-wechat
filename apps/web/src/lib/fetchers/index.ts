import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import type { FileInfo, ImageInfo, VideoInfo, VoiceInfo } from "@/schema";
import { getDataAdapter } from "../data-adapter.ts";
import * as ImageController from "@/adapters/ios-backup/controllers/image";
import * as VideoController from "@/adapters/ios-backup/controllers/video";
import * as VoiceController from "@/adapters/ios-backup/controllers/voice";
import * as AttachController from "@/adapters/ios-backup/controllers/attach";

export function ImageSuspenseQueryOptions(
	requestData: ImageController.GetInput[0],
): UseSuspenseQueryOptions<ImageInfo> {
	return {
		queryKey: [
			`chat: ${requestData.message.chat_id}`,
			`message: ${requestData.message.id}`,
			"image",
		],
		queryFn: async () =>
			await getDataAdapter()
				.getImage(requestData)
				.then((res) => res.data),
	};
}

export function VideoSuspenseQueryOptions(
	requestData: VideoController.GetInput[0],
): UseSuspenseQueryOptions<VideoInfo> {
	return {
		queryKey: [
			`chat: ${requestData.message.chat_id}`,
			`message: ${requestData.message.id}`,
			"video",
		],
		queryFn: () =>
			getDataAdapter()
				.getVideo(requestData)
				.then((res) => res.data),
	};
}

export function VoiceSuspenseQueryOptions(
	requestData: VoiceController.GetInput[0],
): UseSuspenseQueryOptions<VoiceInfo> {
	return {
		queryKey: [
			`chat: ${requestData.message.chat_id}`,
			`message: ${requestData.message.id}`,
			"voice",
		],
		queryFn: () =>
			getDataAdapter()
				.getVoice(requestData)
				.then((res) => res.data),
	};
}

export function AttacheSuspenseQueryOptions(
	requestData: AttachController.GetInput[0],
): UseSuspenseQueryOptions<FileInfo[]> {
	return {
		queryKey: [
			`chat: ${requestData.message.chat_id}`,
			`message: ${requestData.message.id}`,
			"attache",
		],
		queryFn: () =>
			getDataAdapter()
				.getAttach(requestData)
				.then((res) => res.data),
	};
}
