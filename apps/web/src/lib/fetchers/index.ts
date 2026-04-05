import type { ImageInfo, VideoInfo, VoiceInfo } from "@repo/types";
import {
	GetMessageAttachRequest,
	GetMessageImageRequest,
	GetMessageVideoRequest,
	GetMessageVoiceRequest,
} from "@repo/types/adapter";
import type { UseQueryOptions } from "@tanstack/react-query";
import { omit } from "es-toolkit";
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
			omit(requestData, ["account", "chat", "message"]),
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
			omit(requestData, ["account", "chat", "message"]),
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
