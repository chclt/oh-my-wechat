import { expect, test } from "vitest";
import { parseLocalInfo } from "./index.ts";
import stringLocalInfo from "../../../../tests/dataset/LocalInfo.data/LocalInfo.data?raw";
import stringLocalInfo_2 from "../../../../tests/dataset/LocalInfo.data/LocalInfo_2.data?raw";

function transformStringToUint8Array(string: string): Uint8Array {
	const textEncoder = new TextEncoder(); // always utf-8
	return textEncoder.encode(string);
}

test("LocalInfo.data", async () => {
	expect(
		parseLocalInfo(transformStringToUint8Array(stringLocalInfo)),
	).toStrictEqual({
		id: "wxid_00000000000000",
	});

	expect(
		parseLocalInfo(transformStringToUint8Array(stringLocalInfo_2)),
	).toStrictEqual({
		id: "wxid_00000000000000",
	});
});
