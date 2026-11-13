import type { ImageInfo, VideoInfo, VoiceInfo } from "@repo/types";
import {
	GetMessageAttachRequest,
	GetMessageImageRequest,
	GetMessageVideoRequest,
	GetMessageVoiceRequest,
} from "@repo/types/adapter";
import { mutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { omit } from "es-toolkit";
import { getDataAdapter } from "../data-adapter.ts";
import { downloadMessageFile } from "../download-message-file";

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

export function MessageAttachDownloadMutationOptions(
	requestData: GetMessageAttachRequest,
	filename: string,
) {
	return mutationOptions({
		mutationKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			"download-attachment",
		],
		mutationFn: async () => {
			const adapter = getDataAdapter();
			const { data } = await adapter.getMessageAttach(requestData);
			if (data) await downloadMessageFile(adapter, data.uri, filename);
			return data ?? null;
		},
	});
}
