import type { User } from "@/lib/schema.ts";
import { type ClassValue, clsx } from "clsx";
import protobuf from "protobufjs";
import type { Database } from "sql.js";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeUnicodeReferences(encodedHTMLComponent: string) {
  try {
    return encodedHTMLComponent.replace(/&#x(.*?);/g, (_, p1) =>
      String.fromCodePoint(Number.parseInt(p1, 16)),
    );
  } catch (error) {
    if ((typeof encodedHTMLComponent as unknown) === "number") {
      // XMLParser 会把数字内容字符串转换为数字，这个时候会报错，但是也不需要转换
    } else {
      console.error(error);
    }
    return encodedHTMLComponent;
  }
}

export function formatDateTime(date: Date) {
  return date.toLocaleString("zh-CN", {});
}

export async function getFilesFromManifast(
  manifestDatabase: Database,
  directory: FileSystemDirectoryHandle | FileList,
  fileNamePattern: string,
): Promise<
  {
    filename: string;
    file: File;
  }[]
> {
  const rows = manifestDatabase.exec(
    `SELECT * FROM "Files" WHERE "domain" = "AppDomain-com.tencent.xin" AND "relativePath" LIKE "${fileNamePattern}" AND "flags" = 1 ORDER BY relativePath`,
  );

  const fileList = [];

  for (const row of rows[0].values) {
    const manifestFileName = row[0] as string;
    const fileFullName = row[2] as string;
    const fileName = fileFullName.split("/").pop() as string;
    if (manifestFileName.length === 0) continue;
    const filePrefix = manifestFileName.substring(0, 2);
    const file = await getFileFromDirectory(directory, [
      filePrefix,
      manifestFileName,
    ]);
    if (file) fileList.push({ filename: fileName, file });
  }

  return fileList;
}

export async function getFileFromDirectory(
  directory: FileSystemDirectoryHandle | FileList,
  fileName: string | string[],
) {
  if (fileName.length === 0) return null;

  if (directory instanceof FileList) {
    fileName = Array.isArray(fileName) ? fileName.join("/") : fileName;
    let pathTrimLength: number | undefined = undefined;

    const file = Array.from(directory).find((entry) => {
      if (pathTrimLength === undefined) {
        pathTrimLength = entry.webkitRelativePath.indexOf("/") + 1;
      }
      return entry.webkitRelativePath.slice(pathTrimLength) === fileName;
    });
    return file;
  }

  if (directory instanceof FileSystemDirectoryHandle) {
    const fileNameSegment = Array.isArray(fileName)
      ? fileName
      : fileName.split("/");
    const fileNameSegmentLength = fileNameSegment.length;

    if (fileNameSegmentLength === 1) {
      const fileHandle = await directory.getFileHandle(fileNameSegment[0]);
      return await fileHandle.getFile();
    }

    if (fileNameSegmentLength > 1) {
      const subDirectoryHandle = await directory.getDirectoryHandle(
        fileNameSegment[0],
      );
      return getFileFromDirectory(
        subDirectoryHandle,
        fileNameSegment.splice(1),
      );
    }
  }
}

export function parseUserFromMmsetting(buffer: Uint8Array): User {
  let position = 8; // Skip the first 8 bytes
  const result: Partial<User> = {};

  while (position < buffer.length) {
    let keyLength = 0;
    let shift = 0;
    let byte = buffer[position++];
    while (byte & 0x80) {
      keyLength |= (byte & 0x7f) << shift;
      shift += 7;
      byte = buffer[position++];
    }
    keyLength |= (byte & 0x7f) << shift;
    const key = String.fromCharCode.apply(
      null,
      [...buffer].slice(position, position + keyLength),
    );
    position += keyLength;

    let valueLength = 0;
    shift = 0;
    byte = buffer[position++];
    while (byte & 0x80) {
      valueLength |= (byte & 0x7f) << shift;
      shift += 7;
      byte = buffer[position++];
    }
    valueLength |= (byte & 0x7f) << shift;
    const valueBuffer = buffer.slice(position, position + valueLength);

    position += valueLength;

    if (key === "headimgurl") {
      if (!result.photo)
        result.photo = {
          thumb: new TextDecoder("utf-8").decode(valueBuffer.slice(2)),
        };
      else
        result.photo.thumb = new TextDecoder("utf-8").decode(
          valueBuffer.slice(2),
        );
    } else if (key === "headhdimgurl") {
      if (!result.photo)
        result.photo = {
          thumb: new TextDecoder("utf-8").decode(valueBuffer.slice(2)),
          origin: new TextDecoder("utf-8").decode(valueBuffer.slice(2)),
        };
      else
        result.photo.origin = new TextDecoder("utf-8").decode(
          valueBuffer.slice(2),
        );
    } else if (key === "63") {
      result.background = new TextDecoder("utf-8").decode(valueBuffer.slice(1));
    } else if (key === "86") {
      result.id = new TextDecoder("utf-8").decode(valueBuffer.slice(1));
    } else if (key === "87") {
      result.user_id = new TextDecoder("utf-8").decode(valueBuffer.slice(1));
    } else if (key === "88") {
      result.username = new TextDecoder("utf-8").decode(valueBuffer.slice(1));
    } else if (key === "89") {
      result.bio = new TextDecoder("utf-8").decode(valueBuffer.slice(1));
    } else if (key === "91") {
      result.phone = new TextDecoder("utf-8").decode(valueBuffer.slice(1));
    }
  }

  return result as User;
}

export function parseLocalInfo(localInfoBuffer: Uint8Array): { id: string } {
  const result = protobuf.Root.fromJSON({
    nested: {
      LocalInfo: {
        fields: {
          id: {
            type: "string",
            id: 1,
          },
        },
      },
    },
  })
    .lookupType("LocalInfo")
    .decode(localInfoBuffer);

  return result as unknown as { id: string };
}
