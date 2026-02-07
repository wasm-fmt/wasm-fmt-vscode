import vscode = require("vscode");

import wasm from "@wasm-fmt/ruff_fmt/wasm";
import { format, format_range, initSync, type Config } from "@wasm-fmt/ruff_fmt/web";
import { utf16OffsetToUtf8, utf8OffsetToUtf16 } from "../utils";

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

	logger = vscode.window.createOutputChannel("wasm-fmt/python", { log: true });
	inited = new Promise((resolve, reject) => {
		vscode.workspace.fs.readFile(wasm_uri).then(
			(bits) => {
				initSync(bits);
				logger.info("ruff_fmt inited");
				resolve();
			},
			(error) => {
				logger.error("failed to init ruff_fmt", error);
				reject(error);
			},
		);
	});
	return inited;
}

function getConfig(options: vscode.FormattingOptions): Config {
	return {
		indent_style: options.insertSpaces ? "space" : "tab",
		indent_width: options.tabSize,
	};
}

export function formatCode(code: string, filename: string, options: vscode.FormattingOptions) {
	logger.info("formatting", filename, "with options", options);

	try {
		return format(code, filename, getConfig(options));
	} catch (error) {
		logger.error("failed to format", filename, error);
		return null;
	}
}

const selector: vscode.DocumentSelector = ["python", { pattern: "**/*.py", scheme: "file" }];

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
				const formatted = formatCode(text, document.fileName, options);

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

				try {
					const result = format_range(
						text,
						{
							start: utf16OffsetToUtf8(text, document.offsetAt(range.start)),
							end: utf16OffsetToUtf8(text, document.offsetAt(range.end)),
						},
						document.fileName,
						getConfig(options),
					);

					const replaceRange = new vscode.Range(
						document.positionAt(utf8OffsetToUtf16(text, result.source_range.start)),
						document.positionAt(utf8OffsetToUtf16(text, result.source_range.end)),
					);

					return [vscode.TextEdit.replace(replaceRange, result.code)];
				} catch (error) {
					logger.error("failed to format range", document.fileName, error);
					return [];
				}
			},
		}),
	);
}
