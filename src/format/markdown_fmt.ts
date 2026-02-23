import vscode = require("vscode");

import wasm from "@wasm-fmt/markdown/wasm";
import { format, initSync, set_format_code_block } from "@wasm-fmt/markdown/web";

// Import all formatters for code block formatting
import * as clang_format from "./clang-format";
import * as dart_fmt from "./dart_fmt";
import * as gofmt from "./gofmt";
import * as lua_fmt from "./lua_fmt";
import * as mago_fmt from "./mago_fmt";
import * as ruff_fmt from "./ruff_fmt";
import * as shfmt from "./shfmt";
import * as sql_fmt from "./sql_fmt";
import * as taplo_fmt from "./taplo_fmt";
import * as web_fmt from "./web_fmt";
import * as yamlfmt from "./yamlfmt";
import * as zig_fmt from "./zig_fmt";

let wasm_uri: vscode.Uri = null!;

export function init(context: vscode.ExtensionContext) {
	wasm_uri = vscode.Uri.joinPath(context.extensionUri, wasm);
}

let logger: vscode.LogOutputChannel = null!;

// Formatter interface for code block formatting
interface CodeBlockFormatter {
	load: () => Promise<void> | null;
	format: (code: string, tag: string, options: vscode.FormattingOptions) => string | null;
	isInited: () => boolean;
}

// Formatter registry builder
class FormatterRegistry {
	private formatters: Record<string, CodeBlockFormatter> = {};
	private initPromises: Record<string, Promise<void> | null | undefined> = {};

	private createFormatter(
		name: string,
		formatter: {
			load: () => Promise<void>;
			format: (code: string, tag: string, options: vscode.FormattingOptions) => string | null;
		},
	): CodeBlockFormatter {
		return {
			load: () => {
				if (this.initPromises[name] === null) {
					return null;
				}
				if (this.initPromises[name]) {
					return this.initPromises[name];
				}
				this.initPromises[name] = formatter.load().then(() => {
					this.initPromises[name] = null;
				});
				return this.initPromises[name];
			},
			format: formatter.format,
			isInited: () => this.initPromises[name] === null,
		};
	}

	register(
		name: string,
		tags: string[],
		impl: {
			load: () => Promise<void>;
			format: (code: string, tag: string, options: vscode.FormattingOptions) => string | null;
		},
	): this {
		const formatter = this.createFormatter(name, impl);
		for (const tag of tags) {
			this.formatters[tag] = formatter;
		}
		return this;
	}

	build(): Record<string, CodeBlockFormatter> {
		return this.formatters;
	}
}

// Tag to formatter mapping
// Multiple tags can map to the same formatter
const CODE_BLOCK_FORMATTERS = new FormatterRegistry()
	// Go
	.register("go", ["go", "golang"], {
		load: gofmt.load,
		format: (code, tag, options) => gofmt.formatCode(code, mapTagToFilename(tag), options),
	})
	// Lua
	.register("lua", ["lua"], {
		load: lua_fmt.load,
		format: (code, tag, options) => lua_fmt.formatCode(code, mapTagToFilename(tag), options),
	})
	// Python
	.register("python", ["python", "py"], {
		load: ruff_fmt.load,
		format: (code, tag, options) => ruff_fmt.formatCode(code, mapTagToFilename(tag), options),
	})
	// Zig
	.register("zig", ["zig"], {
		load: zig_fmt.load,
		format: (code, tag, options) => zig_fmt.formatCode(code, mapTagToFilename(tag), options),
	})
	// Dart
	.register("dart", ["dart"], {
		load: dart_fmt.load,
		format: (code, tag, options) => dart_fmt.formatCode(code, mapTagToFilename(tag), options),
	})
	// SQL
	.register("sql", ["sql"], {
		load: sql_fmt.load,
		format: (code, tag, options) => sql_fmt.formatCode(code, mapTagToFilename(tag), options),
	})
	// Shell
	.register("shell", ["shell", "bash", "sh", "zsh"], {
		load: shfmt.load,
		format: (code, tag, options) => shfmt.formatCode(code, mapTagToFilename(tag), options),
	})
	// TOML
	.register("toml", ["toml"], {
		load: taplo_fmt.load,
		format: (code, tag, options) => taplo_fmt.formatCode(code, mapTagToFilename(tag), options),
	})
	// YAML
	.register("yaml", ["yaml", "yml"], {
		load: yamlfmt.load,
		format: (code, tag, options) => yamlfmt.formatCode(code, mapTagToFilename(tag), options),
	})
	// PHP
	.register("php", ["php"], {
		load: mago_fmt.load,
		format: (code, tag, options) => mago_fmt.formatCode(code, mapTagToFilename(tag), options),
	})
	// C/C++ and other clang-format languages
	.register(
		"clang-format",
		[
			"c",
			"cc",
			"cpp",
			"c++",
			"c#",
			"cs",
			"csharp",
			"java",
			"oc",
			"objective-c",
			"oc++",
			"objective-c++",
			"objective-cpp",
			"proto",
			"verilog",
			"systemverilog",
			"glsl",
			"hlsl",
			"cuda",
			"metal",
		],
		{
			load: clang_format.load,
			format: (code, tag, options) =>
				clang_format.formatCode(
					code,
					mapTagToFilename(tag),
					mapTagToLanguageId(tag),
					options,
				),
		},
	)
	// Web development languages (JavaScript, TypeScript, CSS, HTML, JSON, GraphQL, etc.)
	.register(
		"web",
		[
			"javascript",
			"js",
			"typescript",
			"ts",
			"jsx",
			"javascriptreact",
			"tsx",
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
			"gql",
		],
		{
			load: web_fmt.load,
			format: (code, tag, options) =>
				web_fmt.formatCode(code, mapTagToFilename(tag), options),
		},
	)
	.build();

// Pending initialization promises
let pendingInits: Promise<void>[] = [];

// Current formatting options for code blocks
let currentOptions: vscode.FormattingOptions = null!;
let currentFilename: string = null!;

function mapTagToFilename(tag: string): string {
	switch (tag) {
		case "golang":
			return `${currentFilename}.go`;
		case "python":
			return `${currentFilename}.py`;
		case "shell":
		case "bash":
		case "zsh":
			return `${currentFilename}.sh`;
		case "yml":
			return `${currentFilename}.yaml`;
		case "cc":
		case "c++":
			return `${currentFilename}.cpp`;
		case "c#":
		case "csharp":
			return `${currentFilename}.cs`;
		case "oc":
		case "objective-c":
			return `${currentFilename}.m`;
		case "oc++":
		case "objective-cpp":
		case "objective-c++":
			return `${currentFilename}.mm`;
		case "verilog":
			return `${currentFilename}.v`;
		case "systemverilog":
			return `${currentFilename}.sv`;
		case "javascript":
			return `${currentFilename}.js`;
		case "typescript":
			return `${currentFilename}.ts`;
		case "javascriptreact":
			return `${currentFilename}.jsx`;
		case "typescriptreact":
			return `${currentFilename}.tsx`;
		case "gql":
			return `${currentFilename}.graphql`;
		default:
			return `${currentFilename}.${tag}`;
	}
}

function mapTagToLanguageId(tag: string): string {
	switch (tag) {
		case "cc":
		case "c++":
			return "cpp";
		case "c#":
		case "cs":
			return "csharp";
		case "oc":
			return "objective-c";
		case "oc++":
		case "objective-c++":
			return "objective-cpp";
		case "js":
			return "javascript";
		case "jsx":
			return "javascriptreact";
		case "ts":
			return "typescript";
		case "tsx":
			return "typescriptreact";
		case "gql":
			return "graphql";
		default:
			return tag;
	}
}

let loaded: Promise<void> | null = null;

export async function load() {
	if (loaded) {
		return loaded;
	}

	logger = vscode.window.createOutputChannel("wasm-fmt/markdown", {
		log: true,
	});
	loaded = new Promise((resolve, reject) => {
		vscode.workspace.fs.readFile(wasm_uri).then(
			(bits) => {
				initSync(bits);
				set_format_code_block(formatCodeBlock);
				logger.info("markdown_fmt inited");
				resolve();
			},
			(error) => {
				logger.error("failed to init markdown_fmt", error);
				reject(error);
			},
		);
	});
	return loaded;
}

function formatCodeBlock(tag: string, text: string, lineWidth: number): string | null | undefined {
	// Normalize tag: lowercase and trim
	const normalizedTag = tag.toLowerCase().trim();

	const formatter = CODE_BLOCK_FORMATTERS[normalizedTag];
	if (!formatter) {
		// No formatter for this tag, keep original
		return null;
	}

	// Check if formatter is already initialized
	if (formatter.isInited()) {
		try {
			// Use current options from the format operation, or fallback to defaults
			const options = currentOptions ?? {
				insertSpaces: true,
				tabSize: 2,
			};
			return formatter.format(text, normalizedTag, options);
		} catch (error) {
			logger.error(`failed to format code block with tag "${tag}"`, error);
			return null;
		}
	}

	// Formatter not initialized, add to pending queue
	const initPromise = formatter.load();
	if (initPromise && !pendingInits.includes(initPromise)) {
		pendingInits.push(initPromise);
	}

	// Return null to keep original text for now
	// Will be formatted in the second pass
	return null;
}

export async function formatCode(
	code: string,
	filename: string,
	options: vscode.FormattingOptions,
): Promise<string | null> {
	logger.info("formatting", filename, "with options", options);

	// Store options for use in formatCodeBlock callback
	currentOptions = options;
	currentFilename = filename;

	// Reset state for this format operation
	pendingInits = [];

	try {
		// First pass: format markdown and collect pending initializations
		let result = format(code);

		// If there are pending initializations, wait for them and reformat
		if (pendingInits.length > 0) {
			logger.info(`waiting for ${pendingInits.length} formatter(s) to initialize`);
			await Promise.all(pendingInits);
			logger.info("all formatters initialized, running second pass");

			// Second pass: all formatters should be ready now
			pendingInits = [];

			result = format(code);
		}

		return result ?? null;
	} catch (error) {
		logger.error("failed to format", filename, error);
		return null;
	}
}

const selector: vscode.DocumentSelector = ["markdown", { pattern: "**/*.md", scheme: "file" }];

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
			async provideDocumentFormattingEdits(document, options, token) {
				const text = document.getText();
				const formatted = await formatCode(text, document.fileName, options);

				if (!formatted) {
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
