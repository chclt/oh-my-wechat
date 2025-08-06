import type { UserType } from "@/schema";
import protobuf from "protobufjs";
import type { Database } from "sql.js";

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
	if (directory instanceof FileList) {
		const shortFileName = Array.isArray(fileName)
			? fileName.at(-1)
			: fileName.split("/").pop();

		if (!shortFileName) return null;

		return getFileFromITunesFileList(directory, shortFileName);
	}

	if (fileName.length === 0) return null;

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

/**
 * 在我测试的 Safari 17.6 中，File 的 webkitRelativePath 属性会在传到 worker 后消失，
 * 但在 iTunes 的备份文件夹，不同的子文件夹里也不会有重名的文件，所以这里可以不用判断相对路径，
 * 以此兼容 Safari 浏览器
 */
export async function getFileFromITunesFileList(
	fileList: FileList,
	fileName: string,
) {
	return Array.from(fileList).find((entry) => {
		return entry.name === fileName;
	});
}

export function parseUserFromMmsetting(buffer: Uint8Array): UserType {
	const dataKeys: Record<string, keyof UserType> = {
		headimgurl: "photo",
		headhdimgurl: "photo",
		"63": "background",
		"86": "id",
		"87": "user_id",
		"88": "username",
		"89": "bio",
		"91": "phone",
	};

	let position = 8; // Skip the first 8 bytes
	const result: Partial<UserType> = {};

	while (position < buffer.length && Object.keys(dataKeys).length > 0) {
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
		const value = buffer.slice(position, position + valueLength);

		position += valueLength;

		if (dataKeys[key]) {
			if (key === "headimgurl") {
				if (!result.photo)
					result.photo = {
						thumb: new TextDecoder("utf-8").decode(value.slice(2)),
					};
				else
					result.photo.thumb = new TextDecoder("utf-8").decode(value.slice(2));
				delete dataKeys["headimgurl"];
			} else if (key === "headhdimgurl") {
				if (!result.photo)
					result.photo = {
						thumb: new TextDecoder("utf-8").decode(value.slice(2)),
						origin: new TextDecoder("utf-8").decode(value.slice(2)),
					};
				else
					result.photo.origin = new TextDecoder("utf-8").decode(value.slice(2));
				delete dataKeys["headhdimgurl"];
			} else {
				// @ts-ignore
				result[dataKeys[key]] = new TextDecoder("utf-8").decode(value.slice(1));
				delete dataKeys[key];
			}
		}
	}

	return result as UserType;
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
