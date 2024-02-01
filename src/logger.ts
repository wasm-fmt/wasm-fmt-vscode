import vscode = require("vscode");

export class Logger {
	private static readonly output =
		vscode.window.createOutputChannel("wasm-fmt");

	constructor(private scope: string) {}

	public log(...args: any[]) {
		Logger.output.appendLine(`[log][${this.scope}] ${args.join(" ")}`);
	}

	public error(...args: any[]) {
		Logger.output.appendLine(`[error][${this.scope}] ${args.join(" ")}`);
		Logger.output.show();
	}

	public warn(...args: any[]) {
		Logger.output.appendLine(`[warn][${this.scope}] ${args.join(" ")}`);
	}

	public info(...args: any[]) {
		Logger.output.appendLine(`[info][${this.scope}] ${args.join(" ")}`);
	}

	public debug(...args: any[]) {
		Logger.output.appendLine(`[debug][${this.scope}] ${args.join(" ")}`);
	}
}
