import * as NoteMessageFileController from "@/adapters/ios-backup/controllers/note-message-file";
import * as NoteMessageImageController from "@/adapters/ios-backup/controllers/note-message-image";
import * as NoteMessageVideoController from "@/adapters/ios-backup/controllers/note-message-video";
import { getDataAdapter } from "../data-adapter";

export function NoteMessageImageQueryOptions(
	requestData: NoteMessageImageController.GetInput[0],
) {
	return {
		queryKey: [
			`account: ${requestData.accountId}`,
			`chat: ${requestData.message.chat_id}`,
			`message: ${requestData.message.id}`,
			"note-message",
			"image",
		],
		queryFn: () =>
			getDataAdapter()
				.getNoteMessageImage(requestData)
				.then((res) => res.data),
	};
}

export function NoteMessageVideoQueryOptions(
	requestData: NoteMessageVideoController.GetInput[0],
) {
	return {
		queryKey: [
			`account: ${requestData.accountId}`,
			`chat: ${requestData.message.chat_id}`,
			`message: ${requestData.message.id}`,
			"note-message",
			"video",
		],
		queryFn: () =>
			getDataAdapter()
				.getNoteMessageVideo(requestData)
				.then((res) => res.data),
	};
}

export function NoteMessageFileQueryOptions(
	requestData: NoteMessageFileController.GetInput[0],
) {
	return {
		queryKey: [
			`account: ${requestData.accountId}`,
			`chat: ${requestData.message.chat_id}`,
			`message: ${requestData.message.id}`,
			"note-message",
			"file",
		],
		queryFn: () => getDataAdapter().getNoteMessageFile(requestData),
	};
}
