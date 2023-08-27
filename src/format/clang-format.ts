import clang_init, { format as clang_format } from "@wasm-fmt/clang-format";
import clang_wasm from "@wasm-fmt/clang-format/clang-format.wasm";
import * as vscode from "vscode";

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, clang_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	await clang_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider([
		"c",
		"cpp",
		"csharp",
		"java",
		"javascript",
		"json",
		"jsonc",
		"objective-c",
		"objective-cpp",
		"typescript",
		"proto",
	], {
		provideDocumentFormattingEdits(document, options, token) {
			const assumeFilename = languageMap[document.languageId];
			const text = document.getText();

			const IndentWidth = options.tabSize;
			const TabWidth = options.tabSize;

			const UseTab = options.insertSpaces ? "Never" : "ForIndentation";

			const style = JSON.stringify({ ...defaultConfig(document.languageId), IndentWidth, TabWidth, UseTab });

			const formatted = clang_format(text, assumeFilename, style);

			const range = document.validateRange(
				new vscode.Range(document.positionAt(0), document.positionAt(text.length)),
			);
			return [vscode.TextEdit.replace(range, formatted)];
		},
	});
}

const languageMap: Record<string, string> = {
	"c": "main.c",
	"cpp": "main.cc",
	"csharp": "main.cs",
	"java": "Main.java",
	"javascript": "main.js",
	"json": "main.json",
	"jsonc": "main.json",
	"objective-c": "main.m",
	"objective-cpp": "main.mm",
	"typescript": "main.ts",
	"proto": "main.proto",
};

function defaultConfig(languageId: string) {
	const config: Record<string, any> = { BasedOnStyle: "Chromium" };

	switch (languageId) {
		case "c":
		case "cpp":
		case "csharp": {
			config.BasedOnStyle = "Microsoft";
			break;
		}
		case "java": {
			config.BasedOnStyle = "Google";
			break;
		}
		case "javascript":
		case "typescript": {
			config.JavaScriptQuotes = "Double";
			config.AllowShortBlocksOnASingleLine = "Empty";
			break;
		}
	}

	return config;
}