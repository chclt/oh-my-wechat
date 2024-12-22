import type { Chat, Message, VoiceInfo, WCDatabases } from "@/lib/schema.ts";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import CryptoJS from "crypto-js";
import { decode } from "silk-wasm";
import { getFilesFromManifast } from "../utils";

const ffmpegCoreURL =
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js";
const ffmpegWasmURL =
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm";

export const VoiceController = {
  get: async (
    directory: FileSystemDirectoryHandle,
    databases: WCDatabases,
    {
      chat,
      message,

      scope = "all",
    }: {
      chat: Chat;
      message: Message;

      scope: "all" | "transcription";
    },
  ): Promise<VoiceInfo> => {
    const db = databases.manifest;
    if (!db) throw new Error("manifest database is not found");

    const files = await getFilesFromManifast(
      db,
      directory,
      `%/Audio/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
    );

    let result: VoiceInfo = {
      raw_aud_src: "",
    };

    for (const file of files) {
      if (file.filename.endsWith(".aud")) {
        result = {
          ...result,
          raw_aud_src: URL.createObjectURL(file.file),
          src: await (async () => {
            const silk = await decode(await file.file.arrayBuffer(), 24000);

            const ffmpeg = new FFmpeg();
            await ffmpeg.load({
              coreURL: await toBlobURL(ffmpegCoreURL, "text/javascript"),
              wasmURL: await toBlobURL(ffmpegWasmURL, "application/wasm"),
            });
            await ffmpeg.writeFile("input.pcm", silk.data);
            await ffmpeg.exec([
              "-y",
              "-f",
              "s16le",
              "-ar",
              "24000",
              "-ac",
              "1",
              "-i",
              "input.pcm",
              "output.wav",
            ]);
            const wav = await ffmpeg.readFile("output.wav");

            return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
          })(),
        };
      }

      if (file.filename.endsWith(".txt")) {
        result = {
          ...result,
          transcription: await file.file.text(),
        };
      }
    }

    return result;
  },
};
