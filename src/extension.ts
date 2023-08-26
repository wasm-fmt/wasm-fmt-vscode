// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import init, { formattingSubscription } from "./format";
import "./format/ruff_fmt";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	await init(context);

	context.subscriptions.push(formattingSubscription());
}

// This method is called when your extension is deactivated
export function deactivate() {}
