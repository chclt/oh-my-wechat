import { URI_PREFIX } from "../../utils/constants";

export function createImageUri(relativePath: string) {
	return `${URI_PREFIX}${relativePath}`;
}
