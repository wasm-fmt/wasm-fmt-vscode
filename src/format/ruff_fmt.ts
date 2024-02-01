import { format as ruff_fmt, initSync as ruff_init } from "@wasm-fmt/ruff_fmt";
import ruff_wasm from "@wasm-fmt/ruff_fmt/ruff_fmt_bg.wasm";
import vscode = require("vscode");
import { Logger } from "../logger";

const logger = new Logger("ruff-format");

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, ruff_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	ruff_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider("python", {
		provideDocumentFormattingEdits(document, options, token) {
			const text = document.getText();

			const indent_style = options.insertSpaces ? "space" : "tab";
			const indent_width = options.tabSize;

			logger.info(document.fileName, JSON.stringify({ indent_style, indent_width }));

			try {
				const formatted = ruff_fmt(text, document.fileName, {
					indent_style,
					indent_width,
				});

				const range = document.validateRange(
					new vscode.Range(
						document.positionAt(0),
						document.positionAt(text.length),
					),
				);
				return [vscode.TextEdit.replace(range, formatted)];
			} catch (error) {
				logger.error(error);
				return [];
			}
		},
	});
}
