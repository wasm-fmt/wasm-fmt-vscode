import vscode = require("vscode");
import { format as sql_fmt, initSync as sql_init } from "@wasm-fmt/sql_fmt";
import sql_wasm from "@wasm-fmt/sql_fmt/sql_fmt_bg.wasm";
import { Logger } from "../logger";

const logger = new Logger("sql-fmt");

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, sql_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	sql_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider("sql", {
		provideDocumentFormattingEdits(document, options, token) {
			const text = document.getText();

			const indent_style = options.insertSpaces ? "space" : "tab";
			const indent_width = options.tabSize;

			logger.info(
				document.languageId,
				document.fileName,
				JSON.stringify({ indent_style, indent_width }),
			);

			try {
				const formatted = sql_fmt(text, document.fileName, {
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
