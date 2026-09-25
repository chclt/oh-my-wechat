import { runFFmpeg } from "./ffmpeg";

export function convertNoteSpeex(data: Uint8Array): Promise<Blob> {
	return runFFmpeg(async (ffmpeg) => {
		const ogg = wrapNoteSpeex(data);

		try {
			await ffmpeg.writeFile("note.spx", ogg);
			const status = await ffmpeg.exec([
				"-v",
				"error",
				"-xerror",
				"-i",
				"note.spx",
				"-c:a",
				"pcm_s16le",
				"note.wav",
			]);
			if (status !== 0) throw new Error("Note Speex decoding failed");
			const wav = await ffmpeg.readFile("note.wav");
			if (typeof wav === "string")
				throw new Error("Invalid decoded note audio");
			return new Blob([new Uint8Array(wav)], { type: "audio/wav" });
		} finally {
			await ffmpeg.deleteFile("note.spx").catch(() => {});
			await ffmpeg.deleteFile("note.wav").catch(() => {});
		}
	});
}

const FRAME_BYTES = 60;
const FRAME_SAMPLES = 320;

/**
 * WeChat note sample: 16 kHz mono, NB submode 6 (364 bits),
 * WB submode 2 (112 bits), then 4 padding bits (0111).
 * Reject other raw layouts until their packet boundaries have been verified.
 * https://www.speex.org/docs/manual/speex-manual/node8.html
 * https://www.xiph.org/ogg/doc/framing.html
 */
export function wrapNoteSpeex(data: Uint8Array): Uint8Array<ArrayBuffer> {
	if (!data.length || data.length % FRAME_BYTES !== 0) {
		throw new Error("Unsupported or truncated note Speex stream");
	}
	for (let offset = 0; offset < data.length; offset += FRAME_BYTES) {
		if (
			data[offset] >> 3 !== 6 ||
			(data[offset + 45] & 0x0f) !== 0x0a ||
			(data[offset + 59] & 0x0f) !== 0x07
		) {
			throw new Error("Unsupported note Speex frame layout");
		}
	}

	const encoder = new TextEncoder();
	const header = new Uint8Array(80);
	header.set(encoder.encode("Speex   "));
	header.set(encoder.encode("1.2.1"), 8);
	const fields = new DataView(header.buffer);
	// Version, header size, rate, mode, bitstream version, channels, bitrate,
	// frame size, VBR, frames per packet, extra headers, reserved fields.
	[1, 80, 16000, 1, 4, 1, 23800, FRAME_SAMPLES, 0, 1, 0, 0, 0].forEach(
		(value, index) => fields.setInt32(28 + index * 4, value, true),
	);

	// Empty vendor and user-comment list (Vorbis comment packet).
	const comments = new Uint8Array(8);
	const frameCount = data.length / FRAME_BYTES;
	const output = new Uint8Array(
		28 + header.length + 28 + comments.length + frameCount * (28 + FRAME_BYTES),
	);
	let position = 0;
	const appendPage = (
		packet: Uint8Array,
		sequence: number,
		samples: number,
		flags: number,
	) => {
		// Every packet here is < 255 bytes, so one lacing entry suffices.
		const page = output.subarray(position, position + 28 + packet.length);
		page.set(encoder.encode("OggS"));
		page[5] = flags;
		const view = new DataView(page.buffer, page.byteOffset, page.byteLength);
		view.setBigUint64(6, BigInt(samples), true);
		view.setUint32(14, 1, true);
		view.setUint32(18, sequence, true);
		page[26] = 1;
		page[27] = packet.length;
		page.set(packet, 28);
		let crc = 0;
		for (const byte of page) {
			crc ^= byte << 24;
			for (let bit = 0; bit < 8; bit++) {
				crc = (crc << 1) ^ (crc & 0x80000000 ? 0x04c11db7 : 0);
			}
		}
		view.setUint32(22, crc >>> 0, true);
		position += page.length;
	};

	appendPage(header, 0, 0, 2);
	appendPage(comments, 1, 0, 0);
	for (let frame = 0; frame < frameCount; frame++) {
		appendPage(
			data.subarray(frame * FRAME_BYTES, (frame + 1) * FRAME_BYTES),
			frame + 2,
			(frame + 1) * FRAME_SAMPLES,
			frame === frameCount - 1 ? 4 : 0,
		);
	}
	return output;
}
