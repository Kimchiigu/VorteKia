fn main() {
    println!("cargo:rustc-link-arg=/STACK:67108864");
    tauri_build::build()
}
