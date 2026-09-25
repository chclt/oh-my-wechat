import { URI_PREFIX } from "../../utils/constants";

export function createMessageFileUri(relativePath: string) {
	return `${URI_PREFIX}${relativePath}`;
}
