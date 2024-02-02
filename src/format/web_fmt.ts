import vscode = require("vscode");
import {
	format as format_markup,
	format_script,
	format_style,
	initSync as web_init,
} from "@wasm-fmt/web_fmt";
import web_wasm from "@wasm-fmt/web_fmt/web_fmt_bg.wasm";
import { Logger } from "../logger";

const script_logger = new Logger("web_fmt:script");
const style_logger = new Logger("web_fmt:style");
const markup_logger = new Logger("web_fmt:markup");

export default async function init(context: vscode.ExtensionContext) {
	const wasm_uri = vscode.Uri.joinPath(context.extensionUri, web_wasm);

	const bits = await vscode.workspace.fs.readFile(wasm_uri);
	web_init(bits);
}

export function formattingSubscription() {
	const script_sub = vscode.languages.registerDocumentFormattingEditProvider(
		["javascript", "javascriptreact", "typescript", "typescriptreact"],
		{
			provideDocumentFormattingEdits(document, options, token) {
				const text = document.getText();

				const indent_style = options.insertSpaces ? "space" : "tab";
				const indent_width = options.tabSize;

				script_logger.log(
					document.languageId,
					document.fileName,
					JSON.stringify({ indent_style, indent_width }),
				);

				const fileName = normalize_script_extension(
					document.fileName,
					document.languageId,
				);

				try {
					const formatted = format_script(text, fileName, {
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
					script_logger.error(error);
					return [];
				}
			},
		},
	);
	const style_sub = vscode.languages.registerDocumentFormattingEditProvider(
		["css", "less", "sass", "scss"],
		{
			provideDocumentFormattingEdits(document, options, token) {
				const text = document.getText();

				const indent_style = options.insertSpaces ? "space" : "tab";
				const indent_width = options.tabSize;

				style_logger.log(
					document.languageId,
					document.fileName,
					JSON.stringify({ indent_style, indent_width }),
				);

				const fileName = normalize_style_extension(
					document.fileName,
					document.languageId,
				);

				try {
					const formatted = format_style(text, fileName, {
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
					style_logger.error(error);
					return [];
				}
			},
		},
	);
	const markup_sub = vscode.languages.registerDocumentFormattingEditProvider(
		[
			"html",
			"jinja",
			"svelte",
			"twig",
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

				markup_logger.log(
					document.languageId,
					document.fileName,
					JSON.stringify({ indent_style, indent_width }),
				);

				const fileName = normalize_markup_extension(
					document.fileName,
					document.languageId,
				);

				try {
					const formatted = format_markup(text, fileName, {
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
					markup_logger.error(error);
					return [];
				}
			},
		},
	);

	return vscode.Disposable.from(script_sub, style_sub, markup_sub);
}

function normalize_script_extension(
	filename: string,
	language_id: string,
): string {
	if (/\.[mc]?[jt]sx?$/i.test(language_id)) {
		return filename;
	}

	switch (language_id) {
		case "javascript":
			return filename + ".js";
		case "javascriptreact":
			return filename + ".jsx";
		case "typescript":
			return filename + ".ts";
		case "typescriptreact":
			return filename + ".tsx";

		default:
			return filename;
	}
}

function normalize_style_extension(
	filename: string,
	language_id: string,
): string {
	if (/\.(?:c|le|sa|sc)ss$/i.test(language_id)) {
		return filename;
	}

	switch (language_id) {
		case "less":
		case "sass":
		case "scss":
		case "css":
			return filename + "." + language_id;

		default:
			return filename + ".css";
	}
}

function normalize_markup_extension(
	filename: string,
	language_id: string,
): string {
	if (/\.html$|\.j2$|\.svelte$|\.twig$|\.vue$/i.test(filename)) {
		return filename;
	}

	switch (language_id) {
		case "jinja":
			return filename + ".j2";
		case "svelte":
			return filename + ".svelte";
		case "twig":
			return filename + ".twig";
		case "vue":
		case "vue-html":
			return filename + ".vue";

		case "html":
		default:
			return filename + ".html";
	}
}
