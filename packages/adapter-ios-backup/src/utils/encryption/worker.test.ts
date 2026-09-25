import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { adapterWorker } from "../../worker";
import fixture from "./test/fixture.json";

vi.mock("comlink", () => ({ expose: vi.fn() }));
vi.mock("../ffmpeg", () => ({ loadFFmpeg: vi.fn().mockResolvedValue({}) }));
vi.mock("../silk", () => ({ convertSilk: vi.fn() }));

class TestFileList extends Array<File> {}
const file = (value: string, name: string) =>
	new File([new Uint8Array(Buffer.from(value, "base64"))], name);
function directory(
	format: "manifestBinary" | "manifestLegacy" = "manifestBinary",
) {
	return new TestFileList(
		file(fixture[format], "Manifest.plist"),
		file(
			format === "manifestLegacy"
				? fixture.manifestPlain
				: fixture.manifestEncrypted,
			"Manifest.db",
		),
		...fixture.files.map((entry) => file(entry.encrypted, entry.fileID)),
	) as unknown as FileList;
}

beforeEach(() => vi.stubGlobal("FileList", TestFileList));
afterEach(async () => {
	await adapterWorker._unloadDirectory();
	vi.unstubAllGlobals();
});

test.each(["manifestBinary", "manifestLegacy"] as const)(
	"reads account IDs from the independent %s backup fixture",
	async (format) => {
		await adapterWorker._loadDirectory(directory(format), fixture.password);
		expect(
			(await adapterWorker.getAccountList()).data.map((account) => account.id),
		).toEqual(["wxid_synthetic_a", "wxid_synthetic_b"]);
	},
);
