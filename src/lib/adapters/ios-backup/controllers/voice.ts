import type { Chat, MessageVM, VoiceInfo, WCDatabases } from "@/lib/schema.ts";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import CryptoJS from "crypto-js";
import { decode } from "silk-wasm";
import { getFilesFromManifast } from "../utils";

const ffmpegCoreURL =
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js";
const ffmpegWasmURL =
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm";

const ffmpeg = new FFmpeg();

let isFFmpegLoading = false; // 防止重复加载, TODO: 更好应该是写一个事件广播

export namespace VoiceController {
  export type GetInput = [
    {
      chat: Chat;
      message: MessageVM;
      scope?: "all" | "transcription";
    },
    { directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
  ];
  export type GetOutput = Promise<VoiceInfo>;

  export async function get(...inputs: GetInput): GetOutput {
    const [{ chat, message, scope = "all" }, { directory, databases }] = inputs;

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

            if (!ffmpeg.loaded) {
              if (!isFFmpegLoading) {
                isFFmpegLoading = true;
                await ffmpeg.load({
                  coreURL: await toBlobURL(ffmpegCoreURL, "text/javascript"),
                  wasmURL: await toBlobURL(ffmpegWasmURL, "application/wasm"),
                });
              }

              // TODO
              while (!ffmpeg.loaded) {
                await new Promise((resolve) => setTimeout(resolve, 200));
              }
            }

            const ffmpegInputFilename = `${message.chat.id}|${message.local_id}.pcm`;
            const ffmpegOutputFilename = `${message.chat.id}|${message.local_id}.wav`;

            await ffmpeg.writeFile(ffmpegInputFilename, silk.data);
            await ffmpeg.exec([
              "-y",
              "-f",
              "s16le",
              "-ar",
              "24000",
              "-ac",
              "1",
              "-i",
              ffmpegInputFilename,
              ffmpegOutputFilename,
            ]);
            const wav = await ffmpeg.readFile(ffmpegOutputFilename);

            ffmpeg.deleteFile(ffmpegInputFilename);
            ffmpeg.deleteFile(ffmpegOutputFilename);

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
  }
}
