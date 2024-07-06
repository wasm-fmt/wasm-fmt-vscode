import vscode = require("vscode");
import { format as yamlfmt, initSync as yaml_init } from "@wasm-fmt/yamlfmt";
import sql_wasm from "@wasm-fmt/yamlfmt/yamlfmt_bg.wasm";
import { Logger } from "../logger";

const logger = new Logger("yamlfmt");

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, sql_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	yaml_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider(
		["yaml", "github-actions-workflow"],
		{
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
					const formatted = yamlfmt(text, document.fileName, {
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
