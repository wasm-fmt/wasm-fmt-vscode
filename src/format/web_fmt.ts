import vscode = require("vscode");

import wasm from "@wasm-fmt/web_fmt/wasm";
import { format, initSync } from "@wasm-fmt/web_fmt/web";

let inited: Promise<void> | null = null;
let wasm_uri: vscode.Uri = null!;

let logger: vscode.LogOutputChannel = null!;

export function init(context: vscode.ExtensionContext) {
	wasm_uri = vscode.Uri.joinPath(context.extensionUri, wasm);
}

export async function load() {
	if (inited) {
		return inited;
	}

	logger = vscode.window.createOutputChannel("wasm-fmt/web", { log: true });
	inited = new Promise((resolve, reject) => {
		vscode.workspace.fs.readFile(wasm_uri).then(
			(bits) => {
				initSync(bits);
				logger.info("web_fmt inited");
				resolve();
			},
			(error) => {
				logger.error("failed to init web_fmt", error);
				reject(error);
			},
		);
	});
	return inited;
}

export function formatCode(code: string, filename: string, options: vscode.FormattingOptions) {
	logger.info("formatting", filename, "with options", options);

	try {
		return format(code, filename, {
			indentStyle: options.insertSpaces ? "space" : "tab",
			indentWidth: options.tabSize,
		});
	} catch (error) {
		logger.error("failed to format", filename, error);
		return null;
	}
}

const selector: vscode.DocumentSelector = [
	"javascript",
	"typescript",
	"javascriptreact",
	"typescriptreact",
	"css",
	"scss",
	"sass",
	"less",
	"html",
	"vue",
	"svelte",
	"astro",
	"json",
	"jsonc",
	"graphql",
	{ pattern: "**/*.{js,mjs,cjs,ts,cts,mts,jsx,tsx,ctsx,mtsx}", scheme: "file" },
	{ pattern: "**/*.{css,sass,scss,less}", scheme: "file" },
	{ pattern: "**/*.{html,vue,svelte,astro,jinja,jinja2,twig}", scheme: "file" },
	{ pattern: "**/*.{json,jsonc}", scheme: "file" },
	{ pattern: "**/*.{gql,graphql}", scheme: "file" },
];

export function formattingSubscription(): vscode.Disposable {
	return vscode.Disposable.from(
		vscode.workspace.onDidOpenTextDocument((document) => {
			if (vscode.languages.match(selector, document)) {
				load();
			}
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor && vscode.languages.match(selector, editor.document)) {
				load();
			}
		}),
		vscode.languages.registerDocumentFormattingEditProvider(selector, {
			provideDocumentFormattingEdits(document, options, token) {
				const text = document.getText();

				const formatted = formatCode(
					text,
					mapFilename(document.fileName, document.languageId, document.isUntitled),
					options,
				);

				if (formatted === null) {
					return [];
				}

				const fullRange = new vscode.Range(
					document.positionAt(0),
					document.positionAt(text.length),
				);

				return [vscode.TextEdit.replace(fullRange, formatted)];
			},
		}),
	);
}

function mapFilename(filename: string, languageId: string, isUntitled: boolean): string {
	if (!isUntitled) {
		return filename;
	}
	switch (languageId) {
		case "javascript":
			return `${filename}.js`;
		case "typescript":
			return `${filename}.ts`;
		case "javascriptreact":
			return `${filename}.jsx`;
		case "typescriptreact":
			return `${filename}.tsx`;
		case "css":
			return `${filename}.css`;
		case "scss":
			return `${filename}.scss`;
		case "sass":
			return `${filename}.sass`;
		case "less":
			return `${filename}.less`;
		case "html":
			return `${filename}.html`;
		case "vue":
			return `${filename}.vue`;
		case "svelte":
			return `${filename}.svelte`;
		case "astro":
			return `${filename}.astro`;
		case "json":
			return `${filename}.json`;
		case "jsonc":
			return `${filename}.jsonc`;
		case "graphql":
			return `${filename}.graphql`;
		default:
			return filename;
	}
}
