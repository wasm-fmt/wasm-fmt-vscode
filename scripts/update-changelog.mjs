#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

const version = process.env.npm_package_version;

const CHANGELOG_PATH = fileURLToPath(import.meta.resolve("../CHANGELOG.md"));

let content = readFileSync(CHANGELOG_PATH, "utf-8");

content = content.replace("## [Unreleased]", `## [${version}]`);

writeFileSync(CHANGELOG_PATH, content);
