import {
	ReleaseMessageImageRequest,
	ResolveMessageImageRequest,
} from "@repo/types/adapter";
import { mutationOptions } from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter";

export function ResolveMessageImageMutationOptions() {
	return mutationOptions({
		mutationKey: ["resolveMessageImage"],
		mutationFn: async (requestData: ResolveMessageImageRequest) =>
			getDataAdapter().resolveMessageImage(requestData),
	});
}

export function ReleaseMessageImageMutationOptions() {
	return mutationOptions({
		mutationKey: ["releaseMessageImage"],
		mutationFn: async (requestData: ReleaseMessageImageRequest) =>
			getDataAdapter().releaseMessageImage(requestData),
	});
}
