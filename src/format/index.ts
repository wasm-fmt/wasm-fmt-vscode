import vscode = require("vscode");
import clang_init, {
	formattingSubscription as clang_sub,
} from "./clang-format";
import dart_init, { formattingSubscription as dart_sub } from "./dart_fmt";
import go_init, { formattingSubscription as go_sub } from "./gofmt";
import lua_init, { formattingSubscription as lua_sub } from "./lua_fmt";
import ruff_init, { formattingSubscription as ruff_sub } from "./ruff_fmt";
import sql_init, { formattingSubscription as sql_sub } from "./sql_fmt";
import web_init, { formattingSubscription as web_sub } from "./web_fmt";
import yaml_init, { formattingSubscription as yaml_sub } from "./yamlfmt";
import zig_init, { formattingSubscription as zig_sub } from "./zig_fmt";

export default function init(context: vscode.ExtensionContext) {
	return Promise.all([
		clang_init(context),
		dart_init(context),
		go_init(context),
		lua_init(context),
		ruff_init(context),
		sql_init(context),
		web_init(context),
		yaml_init(context),
		zig_init(context),
	]);
}

export function formattingSubscription() {
	return vscode.Disposable.from(
		clang_sub(),
		dart_sub(),
		go_sub(),
		lua_sub(),
		ruff_sub(),
		sql_sub(),
		web_sub(),
		yaml_sub(),
		zig_sub(),
	);
}
