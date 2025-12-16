import {
	GetMessageAttachRequest,
	GetMessageImageRequest,
	GetMessageVideoRequest,
	GetMessageVoiceRequest,
} from "@/adapters/adapter.ts";
import type { ImageInfo, VideoInfo, VoiceInfo } from "@/schema";
import type { UseQueryOptions } from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter.ts";

export function MessageImageQueryOptions(
	requestData: GetMessageImageRequest,
): UseQueryOptions<ImageInfo | null> {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			"image",
		],
		queryFn: async () =>
			await getDataAdapter()
				.getMessageImage(requestData)
				.then((res) => res.data ?? null),
	};
}

export function MessageVideoQueryOptions(
	requestData: GetMessageVideoRequest,
): UseQueryOptions<VideoInfo | null> {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			"video",
		],
		queryFn: () =>
			getDataAdapter()
				.getMessageVideo(requestData)
				.then((res) => res.data ?? null),
	};
}

export function MessageVoiceQueryOptions(
	requestData: GetMessageVoiceRequest,
): UseQueryOptions<VoiceInfo | null> {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			"voice",
		],
		queryFn: () =>
			getDataAdapter()
				.getMessageVoice(requestData)
				.then((res) => res.data ?? null),
	};
}

export function MessageAttachQueryOptions(
	requestData: GetMessageAttachRequest,
) {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			"attach",
		],
		queryFn: () =>
			getDataAdapter()
				.getMessageAttach(requestData)
				.then((res) => res.data ?? null),
	};
}
