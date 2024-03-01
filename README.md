<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=wasm-fmt.wasm-fmt">
    <picture>
      <source srcset="./images/icon.svg" type="image/svg+xml" height="128" alt="wasm-fmt logo" />
      <img src="./images/icon.png" height="128" alt="wasm-fmt logo" />
    </picture>
  </a>
</p>

# wasm fmt - Visual Studio Code Extension

wasm fmt is a multi-language code formatting tool with the following advantages:

1. It eliminates the need for a language runtime environment.
2. Powered by WebAssembly, it operates swiftly and reliably across all VSCode environments, including VSCode Desktop, vscode.dev, and github.dev.

## Supported languages

- [ruff_fmt](https://github.com/wasm-fmt/ruff_fmt)

  - [x] Python

- [gofmt](https://github.com/wasm-fmt/gofmt)

  - [x] Golang

- [web_fmt](https://github.com/wasm-fmt/web_fmt)

  - [x] JavaScript / TypeScript / JSX / TSX
  - [x] JSON / JSONC
  - [x] CSS / SCSS / SASS / LESS
  - [x] HTML / Vue / Svelte / Astro / Jinja / Twig

- [clang-format](https://github.com/wasm-fmt/clang-format)

  - [x] C / C++
  - [x] Objective-C / Objective-C++
  - [x] C#
  - [x] Java
  - [ ] JavaScript / TypeScript [^1]
  - [ ] JSON / JSONC [^1]
  - [x] Protobuf

- [zig_fmt](https://github.com/wasm-fmt/zig_fmt)

  - [x] Zig

- [lua_fmt](https://github.com/wasm-fmt/lua_fmt)

  - [x] Lua

- [sql_fmt](https://github.com/wasm-fmt/sql_fmt)

  - [x] SQL

[^1]: JavaScript / TypeScrip / JSON / JSONC are supported by clang-format as well, but web_fmt is used for better output.
