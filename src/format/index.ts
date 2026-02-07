import vscode = require("vscode");

import * as clang_format from "./clang-format";
import * as dart_fmt from "./dart_fmt";
import * as gofmt from "./gofmt";
import * as lua_fmt from "./lua_fmt";
import * as mago_fmt from "./mago_fmt";
import * as markdown_fmt from "./markdown_fmt";
import * as ruff_fmt from "./ruff_fmt";
import * as shfmt from "./shfmt";
import * as sql_fmt from "./sql_fmt";
import * as taplo_fmt from "./taplo_fmt";
import * as web_fmt from "./web_fmt";
import * as yamlfmt from "./yamlfmt";
import * as zig_fmt from "./zig_fmt";

export default function init(context: vscode.ExtensionContext) {
	clang_format.init(context);
	dart_fmt.init(context);
	gofmt.init(context);
	lua_fmt.init(context);
	mago_fmt.init(context);
	markdown_fmt.init(context);
	ruff_fmt.init(context);
	shfmt.init(context);
	sql_fmt.init(context);
	taplo_fmt.init(context);
	web_fmt.init(context);
	yamlfmt.init(context);
	zig_fmt.init(context);
}

export function formattingSubscription() {
	return vscode.Disposable.from(
		clang_format.formattingSubscription(),
		dart_fmt.formattingSubscription(),
		gofmt.formattingSubscription(),
		lua_fmt.formattingSubscription(),
		mago_fmt.formattingSubscription(),
		markdown_fmt.formattingSubscription(),
		ruff_fmt.formattingSubscription(),
		shfmt.formattingSubscription(),
		sql_fmt.formattingSubscription(),
		taplo_fmt.formattingSubscription(),
		web_fmt.formattingSubscription(),
		yamlfmt.formattingSubscription(),
		zig_fmt.formattingSubscription(),
	);
}
