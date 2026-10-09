# Custom FFmpeg WASM

A minimal single-threaded ESM core based on the official `ffmpegwasm/ffmpeg.wasm v12.15`, with a WASM size of approximately 1.62 MiB. Upstream sources are pinned in the `vendor/ffmpeg.wasm` submodule. This package maintains the custom configuration, patches, and artifacts.

Build artifacts are committed to Git.

## Supported features

- Audio: S16LE PCM and Ogg/Speex decoding, PCM encoding, and WAV output.
- Video/images: HEVC decoding, PNG encoding, and image sequence output.
- Processing: image scaling, pixel format and color conversion, and audio resampling.

## Build

Start Docker Desktop, then run from the repository root:

```sh
git submodule update --init vendor/ffmpeg.wasm
pnpm --filter @repo/ffmpeg-wasm build:core
```

Feature selection is defined in `ffmpeg.config.mjs`. The build uses `linux/amd64`. Keep custom changes in this package and leave the submodule unchanged. After modifying the configuration or patches, rebuild and commit the core, build metadata, and licenses in `artifacts/`.

## Frontend integration

The adapter loads artifacts through `@repo/ffmpeg-wasm/core?url` and `@repo/ffmpeg-wasm/wasm?url`, using the official Worker API.
