import type { ImageInfo } from "@/schema";
import CryptoJS from "crypto-js";
import { getFilesFromManifast } from "../utils";
import { DataAdapterResponse, GetImageRequest } from "@/adapters/adapter";
import { WCDatabases } from "../types";

export type GetInput = [
	GetImageRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = Promise<DataAdapterResponse<ImageInfo>>;

export async function get(...inputs: GetInput): GetOutput {
	const [
		{ message, record, size = "origin", domain = "image" },
		{ directory, databases },
	] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		record
			? `%/OpenData/${CryptoJS.MD5(message.chat_id).toString()}/${message.local_id}/${record["@_dataid"]}.%`
			: `%/${
					{
						image: "Img",
						opendata: "OpenData",
						video: "Video",
					}[domain]
				}/${CryptoJS.MD5(message.chat_id).toString()}/${message.local_id}.%`,
	);

	if (!record && domain === "image") {
		const appendFiles = await getFilesFromManifast(
			db,
			directory,
			`%/ImgV2/${CryptoJS.MD5(message.chat_id).toString()}/${message.local_id}.%`,
		);

		files.push(...appendFiles);
	}

	const result: ImageInfo = [];

	const PhotpSizeOrder: {
		fileSuffix: string;
		photo: ImageInfo[number] | undefined;
	}[] = [
		{ fileSuffix: "pic_hd", photo: undefined },
		{ fileSuffix: "pic", photo: undefined },
		{ fileSuffix: "pic_thum", photo: undefined },
		{ fileSuffix: "record_thum", photo: undefined },
		{ fileSuffix: "video_thum", photo: undefined },
	];

	for (const file of files) {
		if (file.filename.endsWith(".pic_hd")) {
			const newPhoto: ImageInfo[number] = {
				size: "origin",
				src: URL.createObjectURL(file.file),
			};
			const photo = PhotpSizeOrder.find((item) => item.fileSuffix === "pic_hd");
			if (photo) photo.photo = newPhoto;
		}

		if (file.filename.endsWith(".pic")) {
			const newPhoto: ImageInfo[number] = {
				size: "origin",
				src: URL.createObjectURL(file.file),
			};
			const photo = PhotpSizeOrder.find((item) => item.fileSuffix === "pic");
			if (photo) photo.photo = newPhoto;
		}

		if (file.filename.endsWith(".pic_thum")) {
			const newPhoto: ImageInfo[number] = {
				size: "thumb",
				src: URL.createObjectURL(file.file),
				// width: Number.parseInt(messageEntity.msg.img["@_cdnthumbwidth"]),
				// height: Number.parseInt(messageEntity.msg.img["@_cdnthumbheight"]),
			};
			const photo = PhotpSizeOrder.find(
				(item) => item.fileSuffix === "pic_thum",
			);
			if (photo) photo.photo = newPhoto;
		}

		if (file.filename.endsWith(".record_thum")) {
			const newPhoto: ImageInfo[number] = {
				size: "thumb",
				src: URL.createObjectURL(file.file),
				// width: Number.parseInt(messageEntity.msg.img["@_cdnthumbwidth"]),
				// height: Number.parseInt(messageEntity.msg.img["@_cdnthumbheight"]),
			};
			const photo = PhotpSizeOrder.find(
				(item) => item.fileSuffix === "record_thum",
			);
			if (photo) photo.photo = newPhoto;
		}

		if (file.filename.endsWith(".video_thum")) {
			const newPhoto: ImageInfo[number] = {
				size: "thumb",
				src: URL.createObjectURL(file.file),
				// width: Number.parseInt(messageEntity.msg.img["@_cdnthumbwidth"]),
				// height: Number.parseInt(messageEntity.msg.img["@_cdnthumbheight"]),
			};
			const photo = PhotpSizeOrder.find(
				(item) => item.fileSuffix === "video_thum",
			);
			if (photo) photo.photo = newPhoto;
		}
	}

	for (const item of PhotpSizeOrder) {
		if (item.photo) result.push(item.photo);
	}

	return { data: result };
}
