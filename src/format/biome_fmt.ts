import {
	format as biome_fmt,
	initSync as biome_init,
} from "@wasm-fmt/biome_fmt";
import biome_wasm from "@wasm-fmt/biome_fmt/biome_fmt_bg.wasm";
import vscode = require("vscode");
import { Logger } from "../logger";

const logger = new Logger("biome-format");

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, biome_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	biome_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider(
		["javascript", "javascriptreact", "typescript", "typescriptreact"],
		{
			provideDocumentFormattingEdits(document, options, token) {
				const text = document.getText();

				const indent_style = options.insertSpaces ? "space" : "tab";
				const indent_width = options.tabSize;
				logger.info("indent_style:", indent_style);
				logger.info("indent_width:", indent_width);
				logger.info("filename", document.fileName);

				try {
					const formatted = biome_fmt(text, document.fileName, {
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
		},
	);
}
