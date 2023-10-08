import * as vscode from "vscode";
import biome_init, { formattingSubscription as biome_sub } from "./biome_fmt";
import clang_init, {
	formattingSubscription as clang_sub,
} from "./clang-format";
import go_init, { formattingSubscription as go_sub } from "./gofmt";
import ruff_init, { formattingSubscription as ruff_sub } from "./ruff_fmt";
import zig_init, { formattingSubscription as zig_sub } from "./zig_fmt";

export default function init(context: vscode.ExtensionContext) {
	return Promise.all([
		biome_init(context),
		go_init(context),
		ruff_init(context),
		clang_init(context),
		zig_init(context),
	]);
}

export function formattingSubscription() {
	return vscode.Disposable.from(
		biome_sub(),
		go_sub(),
		ruff_sub(),
		clang_sub(),
		zig_sub(),
	);
}
