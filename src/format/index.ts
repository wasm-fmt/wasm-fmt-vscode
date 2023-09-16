import * as vscode from "vscode";
import clang_init, {
	formattingSubscription as clang_sub,
} from "./clang-format";
import go_init, { formattingSubscription as go_sub } from "./gofmt";
import rome_init, { formattingSubscription as rome_sub } from "./rome_fmt";
import ruff_init, { formattingSubscription as ruff_sub } from "./ruff_fmt";
import zig_init, { formattingSubscription as zig_sub } from "./zig_fmt";

export default function init(context: vscode.ExtensionContext) {
	return Promise.all([
		rome_init(context),
		go_init(context),
		ruff_init(context),
		clang_init(context),
		zig_init(context),
	]);
}

export function formattingSubscription() {
	return vscode.Disposable.from(
		rome_sub(),
		go_sub(),
		ruff_sub(),
		clang_sub(),
		zig_sub(),
	);
}
