import { format as malva_fmt, initSync as malva_init } from "malva";
import malva_wasm from "malva/standalone_wasm_bg.wasm";
import vscode = require("vscode");
import { Logger } from "../logger";

const logger = new Logger("malva-format");

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, malva_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	malva_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider(
		["css", "scss", "sass", "less"],
		{
			provideDocumentFormattingEdits(document, options, token) {
				const text = document.getText();

				const useTabs = !options.insertSpaces;
				const indentWidth = options.tabSize;

				try {
					const formatted = malva_fmt(text, document.languageId, {
						useTabs,
						indentWidth,
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
