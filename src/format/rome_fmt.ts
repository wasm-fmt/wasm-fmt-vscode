import rome_init, { format as rome_fmt } from "@wasm-fmt/rome_fmt";
import rome_wasm from "@wasm-fmt/rome_fmt/rome_fmt_bg.wasm";
import * as vscode from "vscode";

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, rome_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	await rome_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider([
		"javascript",
		"javascriptreact",
		"typescript",
		"typescriptreact",
	], {
		provideDocumentFormattingEdits(document, options, token) {
			const text = document.getText();

			const indent_style = options.insertSpaces ? options.tabSize : "tab";

			const formatted = rome_fmt(text, document.fileName, {
				indent_style,
			});

			const range = document.validateRange(
				new vscode.Range(document.positionAt(0), document.positionAt(text.length)),
			);
			return [vscode.TextEdit.replace(range, formatted)];
		},
	});
}
