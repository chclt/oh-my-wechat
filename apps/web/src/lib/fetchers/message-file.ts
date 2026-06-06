import {
	ReleaseMessageFileRequest,
	ResolveMessageFileRequest,
} from "@repo/types/adapter";
import { mutationOptions } from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter";

export function ResolveMessageFileMutationOptions() {
	return mutationOptions({
		mutationKey: ["resolveMessageFile"],
		mutationFn: async (requestData: ResolveMessageFileRequest) =>
			getDataAdapter().resolveMessageFile(requestData),
	});
}

export function ReleaseMessageFileMutationOptions() {
	return mutationOptions({
		mutationKey: ["releaseMessageFile"],
		mutationFn: async (requestData: ReleaseMessageFileRequest) =>
			getDataAdapter().releaseMessageFile(requestData),
	});
}
