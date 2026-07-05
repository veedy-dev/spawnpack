import { pascalCase } from "es-toolkit";
import * as JSONC from "jsonc-parser";
import { glob, mkdir, readFile, writeFile } from "node:fs/promises";
import { matchesGlob } from "node:path";

const entries = [
	{
		type: "BlockId",
		pattern: "BP/blocks/**/*.json",
		jsonPath: ["minecraft:block", "description", "identifier"],
		identifiers: [],
	},
	{
		type: "EntityId",
		pattern: "BP/entities/**/*.json",
		jsonPath: ["minecraft:entity", "description", "identifier"],
		identifiers: [],
	},
	{
		type: "ItemId",
		pattern: "BP/items/**/*.json",
		jsonPath: ["minecraft:item", "description", "identifier"],
		identifiers: [],
	},
];

for (const dir of ["BP", "RP"]) {
	for await (const path of glob(`${dir}/**/*.json`)) {
		const entry = entries.find((f) => matchesGlob(path, f.pattern));
		if (!entry) continue;

		let found = false;
		const text = await readFile(path, "utf8");
		JSONC.visit(text, {
			onArrayBegin() {
				return !found;
			},
			onObjectBegin() {
				return !found;
			},
			onLiteralValue(value, _offset, _length, _startLine, _startCharacter, pathSupplier) {
				if (typeof value !== "string") return;
				if (!pathSupplier().every((segment, i) => segment === entry.jsonPath[i])) return;

				found = true;
				entry.identifiers.push(value);
			},
		});
	}
}

const lines = ["// Auto-generated file. DO NOT EDIT MANUALLY!\n"];

for (const entry of entries) {
	if (entry.identifiers.length === 0) continue;

	lines.push(`export const enum ${entry.type} {`);
	for (const id of entry.identifiers) {
		const colIndex = id.indexOf(":");
		if (colIndex === -1) {
			console.warn(`Invalid identifier: ${id}`);
			continue;
		}
		const name = id.slice(colIndex + 1).trim();
		if (name === "") {
			console.warn(`Invalid identifier: ${id}`);
			continue;
		}
		lines.push(`\t${pascalCase(name)} = "${id}",`);
	}
	lines.push(`}\n`);
}

const res = lines.join("\n");

const ROOT_DIR = process.env.ROOT_DIR;

const current = await readFile(`${ROOT_DIR}/data/scripts/generated_types.ts`, "utf8")
	.catch(() => null);

if (current !== res) {
	await Promise.all([
		writeFile(`${ROOT_DIR}/data/scripts/generated_types.ts`, res),
		writeFile("./data/scripts/generated_types.ts", res),
	]);
}
