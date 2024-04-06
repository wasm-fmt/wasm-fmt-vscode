import vscode = require("vscode");
import dart_init, { format as dart_fmt } from "@wasm-fmt/dart_fmt";
import dart_wasm from "@wasm-fmt/dart_fmt/dart_fmt.wasm";
import { Logger } from "../logger";

const logger = new Logger("dart-fmt");

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, dart_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	await dart_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider("dart", {
		provideDocumentFormattingEdits(document, options, token) {
			const text = document.getText();

			logger.info(document.languageId, document.fileName);

			try {
				const formatted = dart_fmt(text, document.fileName);

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
