import vscode = require("vscode");
import biome_init, { formattingSubscription as biome_sub } from "./biome_fmt";
import clang_init, {
	formattingSubscription as clang_sub,
} from "./clang-format";
import go_init, { formattingSubscription as go_sub } from "./gofmt";
import malva_init, { formattingSubscription as malva_sub } from "./malva_fmt";
import ruff_init, { formattingSubscription as ruff_sub } from "./ruff_fmt";
import zig_init, { formattingSubscription as zig_sub } from "./zig_fmt";

export default function init(context: vscode.ExtensionContext) {
	return Promise.all([
		biome_init(context),
		clang_init(context),
		go_init(context),
		malva_init(context),
		ruff_init(context),
		zig_init(context),
	]);
}

export function formattingSubscription() {
	return vscode.Disposable.from(
		biome_sub(),
		clang_sub(),
		go_sub(),
		malva_sub(),
		ruff_sub(),
		zig_sub(),
	);
}
