/** Read the initial frame without seeking or pausing the visible player. */
export function getVideoPoster(
	src: string,
	signal: AbortSignal,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");
		const cleanup = () => {
			video.onloadeddata = null;
			video.onerror = null;
			signal.removeEventListener("abort", cancel);
			video.removeAttribute("src");
			video.load();
		};
		const fail = (error: unknown) => {
			cleanup();
			reject(error);
		};
		const cancel = () => fail(signal.reason);

		video.onloadeddata = () => {
			try {
				const canvas = document.createElement("canvas");
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				canvas.getContext("2d")!.drawImage(video, 0, 0);
				canvas.toBlob((poster) => {
					cleanup();
					if (poster) resolve(poster);
					else reject(new Error("Unable to encode video poster"));
				});
			} catch (error) {
				fail(error);
			}
		};
		video.onerror = () =>
			fail(new Error("Unable to decode video poster", { cause: video.error }));
		signal.addEventListener("abort", cancel, { once: true });
		video.preload = "auto";
		video.src = src;
	});
}
