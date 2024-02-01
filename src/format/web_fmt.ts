import { format as web_fmt, initSync as web_init } from "@wasm-fmt/web_fmt";
import web_wasm from "@wasm-fmt/web_fmt/web_fmt_bg.wasm";
import vscode = require("vscode");
import { Logger } from "../logger";

const logger = new Logger("web_fmt");

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, web_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	web_init(bits);
}

export function formattingSubscription() {
	return vscode.languages.registerDocumentFormattingEditProvider(
		[
			"css",
			"html",
			"javascript",
			"javascriptreact",
			"jinja",
			"less",
			"sass",
			"scss",
			"svelte",
			"twig",
			"typescript",
			"typescriptreact",
			"vue",
			"vue-html",
			{ pattern: "**/*.j2", scheme: "file" },
			{ pattern: "**/*.svelte", scheme: "file" },
			{ pattern: "**/*.twig", scheme: "file" },
		],
		{
			provideDocumentFormattingEdits(document, options, token) {
				const text = document.getText();

				const indent_style = options.insertSpaces ? "space" : "tab";
				const indent_width = options.tabSize;

				logger.log(document.fileName, JSON.stringify({ indent_style, indent_width }));

				try {
					const formatted = web_fmt(text, document.fileName, {
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
