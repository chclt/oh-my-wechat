fn main() {
    println!("cargo:rerun-if-changed=../scripts/prepare-ffmpeg.mjs");
    println!("cargo:rerun-if-changed=../package.json");
    let target = std::env::var("TARGET").unwrap();
    println!("cargo:rerun-if-changed=../../../packages/ffmpeg/ffmpeg.config.mjs");
    println!("cargo:rerun-if-changed=../../../packages/ffmpeg/dist/{target}");
    let status = std::process::Command::new("node")
        .arg("../scripts/prepare-ffmpeg.mjs")
        .arg(target)
        .status()
        .expect("Node.js is required to prepare the bundled FFmpeg");
    assert!(status.success(), "Cannot prepare bundled FFmpeg");
    tauri_build::build();
}
