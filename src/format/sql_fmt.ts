import vscode = require("vscode");

import wasm from "@wasm-fmt/sql_fmt/wasm";
import { format, initSync } from "@wasm-fmt/sql_fmt/web";

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

	logger = vscode.window.createOutputChannel("wasm-fmt/sql", { log: true });
	inited = new Promise((resolve, reject) => {
		vscode.workspace.fs.readFile(wasm_uri).then(
			(bits) => {
				initSync(bits);
				logger.info("sql_fmt inited");
				resolve();
			},
			(error) => {
				logger.error("failed to init sql_fmt", error);
				reject(error);
			},
		);
	});
	return inited;
}

export function formatCode(code: string, filename: string, options: vscode.FormattingOptions) {
	logger.info("formatting", filename, "with options", options);

	try {
		return format(code, {
			indent_style: options.insertSpaces ? "space" : "tab",
			indent_width: options.tabSize,
		});
	} catch (error) {
		logger.error("failed to format", filename, error);
		return null;
	}
}

const selector: vscode.DocumentSelector = ["sql", { pattern: "**/*.sql", scheme: "file" }];

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
	);
}
