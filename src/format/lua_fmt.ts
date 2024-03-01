import vscode = require("vscode");
import { format as lua_fmt, initSync as lua_init } from "@wasm-fmt/lua_fmt";
import lua_wasm from "@wasm-fmt/lua_fmt/lua_fmt_bg.wasm";
import { Logger } from "../logger";

const logger = new Logger("lua-fmt");

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, lua_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	lua_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider("lua", {
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
				const formatted = lua_fmt(text, {
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
