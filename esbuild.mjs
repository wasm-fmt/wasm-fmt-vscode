#!/usr/bin/env node
import * as esbuild from "esbuild";
import process from "node:process";

/**
 * @typedef {import("esbuild").BuildOptions} BuildOptions
 */

/**
 * @type BuildOptions
 */
const options = {
	entryPoints: ["src/extension.ts"],
	outdir: "out",
	publicPath: "out",
	bundle: true,
	target: "es2020",
	loader: { ".wasm": "file" },
	external: ["vscode"],
	platform: "node",
};

if (process.argv.includes("--watch")) {
	const ctxt = await esbuild.context(options);
	ctxt.watch();
	console.log("Watching for changes...");

	process.on("SIGINT", () => {
		ctxt.dispose();
		console.log("Stopped and cleaned up.");
		process.exit(0);
	});
} else {
	await esbuild.build(options);
}
