import * as vscode from "vscode";
import clang_init, { formattingSubscription as clang_sub } from "./clang-format";
import go_init, { formattingSubscription as go_sub } from "./gofmt";
import ruff_init, { formattingSubscription as ruff_sub } from "./ruff_fmt";

export default function init(context: vscode.ExtensionContext) {
	return Promise.all([go_init(context), ruff_init(context), clang_init(context)]);
}

export function formattingSubscription() {
	return vscode.Disposable.from(go_sub(), ruff_sub(), clang_sub());
}
