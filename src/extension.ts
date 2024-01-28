// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode = require("vscode");
import init, { formattingSubscription } from "./format";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function activate(context: vscode.ExtensionContext) {
	await init(context);

	context.subscriptions.push(formattingSubscription());
}

// This method is called when your extension is deactivated
function deactivate() {}

export = {
	activate,
	deactivate,
};
