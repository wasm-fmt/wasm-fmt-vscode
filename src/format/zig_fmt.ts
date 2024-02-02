import vscode = require("vscode");
import zig_init, { format as zig_fmt } from "@wasm-fmt/zig_fmt";
import zig_wasm from "@wasm-fmt/zig_fmt/zig_fmt.wasm";
import { Logger } from "../logger";

const logger = new Logger("zig-fmt");

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, zig_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	await zig_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider(
		// TODO: ZON
		["zig", { pattern: "**/*.zig", scheme: "file" }],
		{
			provideDocumentFormattingEdits(document, options, token) {
				const text = document.getText();

				logger.log(document.languageId, document.fileName);

				try {
					const formatted = zig_fmt(text);

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
