import { invoke } from "@tauri-apps/api/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import IosBackupTauriAdapter from "./index";

let adapter: IosBackupTauriAdapter;

vi.mock("@tauri-apps/api/core", () => ({
	invoke: vi.fn(),
}));
beforeEach(async () => {
	vi.mocked(invoke).mockReset();
	adapter = new IosBackupTauriAdapter();
	vi.mocked(invoke).mockResolvedValue(null);
	await adapter._loadAccountDatabase({ id: "me" });
	vi.mocked(invoke).mockReset();
});

describe("chat invoke boundary", () => {
	it("restores undefined fields and array slots without replacing empty strings", async () => {
		const self = { id: "me", username: "" };
		vi.mocked(invoke).mockResolvedValue({
			data: [
				{
					type: "private",
					id: "missing",
					title: "missing",
					is_pinned: false,
					members: [self, null],
				},
				{
					type: "private",
					id: "me",
					title: "",
					user: self,
					members: [self, self],
				},
				{
					type: "chatroom",
					id: "missing@chatroom",
					title: "-",
					is_pinned: false,
					members: [],
				},
			],
		});
		const { data } = await adapter.getChatList({});
		expect(data[0]).toHaveProperty("user", undefined);
		expect(data[0]!.members).toStrictEqual([self, undefined]);
		expect(data[0]).not.toHaveProperty("photo");
		expect(data[1]!.title).toBe("");
		expect(data[1]).toHaveProperty("is_pinned", undefined);
		expect(data[2]).toHaveProperty("chatroom", undefined);
	});
});
