import vscode = require("vscode");

import wasm from "@wasm-fmt/clang-format/wasm";
import { format, format_byte_range, initSync } from "@wasm-fmt/clang-format/web";
import { utf16OffsetToUtf8 } from "../utils";

let inited: Promise<void> | null = null;
let wasm_uri: vscode.Uri = null!;

let logger: vscode.LogOutputChannel = null!;

export function init(context: vscode.ExtensionContext) {
	wasm_uri = vscode.Uri.joinPath(context.extensionUri, wasm);
}

export async function load() {
	if (inited) {
		return inited;
	}

	logger = vscode.window.createOutputChannel("wasm-fmt/clang-format", {
		log: true,
	});
	inited = new Promise((resolve, reject) => {
		vscode.workspace.fs.readFile(wasm_uri).then(
			(bits) => {
				initSync(bits);
				logger.info("clang-format inited");
				resolve();
			},
			(error) => {
				logger.error("failed to init clang-format", error);
				reject(error);
			},
		);
	});
	return inited;
}

function defaultConfig(languageId: string) {
	const config: Record<string, any> = { BasedOnStyle: "Chromium" };

	switch (languageId) {
		case "csharp": {
			config.BasedOnStyle = "Microsoft";
			break;
		}
		case "java": {
			config.BasedOnStyle = "Google";
			break;
		}
		case "objective-c":
		case "objective-cpp": {
			config.BasedOnStyle = "WebKit";
			break;
		}
	}

	return config;
}

export function formatCode(
	code: string,
	filename: string,
	languageId: string,
	options: vscode.FormattingOptions,
) {
	const IndentWidth = options.tabSize;
	const TabWidth = options.tabSize;
	const UseTab = options.insertSpaces ? "Never" : "ForIndentation";

	const style = JSON.stringify({
		...defaultConfig(languageId),
		IndentWidth,
		TabWidth,
		UseTab,
	});

	logger.info("formatting", filename, "with options", options);

	try {
		return format(code, filename, style);
	} catch (error) {
		logger.error("failed to format", filename, error);
		return null;
	}
}

const selector: vscode.DocumentSelector = [
	"c",
	"cpp",
	"csharp",
	"java",
	"objective-c",
	"objective-cpp",
	"proto",
	"proto3",
	"textproto",
	"glsl",
	"hlsl",
	"cuda",
	"cuda-cpp",
	"metal",
	"verilog",
	"systemverilog",
	"verilog",
	"systemverilog",
	{ pattern: "**/*.proto", scheme: "file" },
	{ pattern: "**/*.{v,vh,vl}", scheme: "file" },
	{ pattern: "**/*.{sv,svh,SV}", scheme: "file" },
];

export function formattingSubscription(): vscode.Disposable {
	return vscode.Disposable.from(
		vscode.workspace.onDidOpenTextDocument((document) => {
			if (vscode.languages.match(selector, document)) {
				load();
			}
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor && vscode.languages.match(selector, editor.document)) {
				load();
			}
		}),
		vscode.languages.registerDocumentFormattingEditProvider(selector, {
			provideDocumentFormattingEdits(document, options, token) {
				const text = document.getText();
				const formatted = formatCode(text, document.fileName, document.languageId, options);

				if (formatted === null) {
					return [];
				}

				const fullRange = new vscode.Range(
					document.positionAt(0),
					document.positionAt(text.length),
				);

				return [vscode.TextEdit.replace(fullRange, formatted)];
			},
		}),
		vscode.languages.registerDocumentRangeFormattingEditProvider(selector, {
			provideDocumentRangeFormattingEdits(document, range, options, token) {
				const text = document.getText();

				logger.info("formatting range", document.fileName, "with options", options);

				const fullRange = new vscode.Range(
					document.positionAt(0),
					document.positionAt(text.length),
				);

				try {
					const start = utf16OffsetToUtf8(text, document.offsetAt(range.start));
					const end = utf16OffsetToUtf8(text, document.offsetAt(range.end));
					const length = end - start;
					const result = format_byte_range(
						text,
						[[start, length]],
						document.fileName,
						JSON.stringify({
							...defaultConfig(document.languageId),
							IndentWidth: options.tabSize,
							TabWidth: options.tabSize,
							UseTab: options.insertSpaces ? "Never" : "ForIndentation",
						}),
					);
					return [vscode.TextEdit.replace(fullRange, result)];
				} catch (error) {
					logger.error("failed to format range", document.fileName, error);
					return [];
				}
			},
		}),
	);
}
