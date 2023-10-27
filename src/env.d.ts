declare module "@wasm-fmt/ruff_fmt/ruff_fmt_bg.wasm" {
	const wasm: string;
	export default wasm;
}

declare module "@wasm-fmt/biome_fmt/biome_fmt_bg.wasm" {
	const wasm: string;
	export default wasm;
}

declare module "@wasm-fmt/*.wasm" {
	const wasm: string;
	export default wasm;
}

declare module "malva";
declare module "malva/standalone_wasm_bg.wasm" {
	const wasm: string;
	export default wasm;
}
