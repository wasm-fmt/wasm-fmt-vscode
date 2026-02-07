# Change Log

All notable changes to the "wasm-fmt" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

Add support for more formatters:

- PHP
- Markdown
- Shell script
- TOML
- GraphQL

## [0.5.2]

Bump dependencies.

## [0.5.1]

Suport range formatting for C/C++ (clang-format).

## [0.5.0]

Add support for YAML and GitHub Actions Workflow.

## [0.4.1]

Bump dependencies.

## [0.4.0]

Add support for Dart.
Require vscode engine 1.88.0.

## [0.3.6]

Bump dependencies.
Pass filename to clang-format.

## [0.3.5]

Support Lua.
Support SQL.

## [0.3.4]

Fix regression: `web_fmt` not working with untitled files.

## [0.3.3]

Support HTML/Svelte/Vue/Jinja/Twig
Note: powered by [markup_fmt](https://github.com/g-plane/markup_fmt)

## [0.3.2]

Revert vscode engine requirement.

## [0.3.1]

Support python in Notebook(ipynb) file.

## [0.3.0]

Introduce new formatter: malva

CSS/SCSS/SASS/LESS are supported.

## [0.2.3]

tune c/cpp default style

## [0.2.2]

use biome for js/ts formatter

## [0.2.1]

Add support for Zig.
Add logger.

## [0.2.0]

Import new Formatter: Rome

Change default formatter for JavaScript/TypeScript to Rome.
Add support for JSX/TSX.

## [0.1.2]

Update default clang-format style.

- C/C++/C# use Microsoft style
- Java use Google style
- JavaScript/TypeScript use Chromium style.

## [0.1.1]

Fix bug: Web Extension plugin should be universal target.

## [0.1.0]

First version

supported languages:

gofmt

    - Golang

Ruff

    - Python

Clang Format

    - C/C++
    - Java
    - C#
    - Objective-C/C++
    - Protobuf
    - JavaScript
    - TypeScript
    - JSON

## [0.0.1]

- Initial release
