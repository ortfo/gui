/// <reference types="vitest" />
import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import commonjs from "@rollup/plugin-commonjs"
import replace from "@rollup/plugin-replace"
import yaml from "@rollup/plugin-yaml"
import { execSync } from "child_process"

const quote = (str: string) => `"${str}"`

export default defineConfig({
    plugins: [
        replace({
            __commitHash__: quote(
                execSync(`git log -n 1 --pretty=format:%h`).toString().trim()
            ),
            __commitDate__: quote(
                new Date(
                    execSync(`git log -n 1 --pretty=format:%cd`).toString()
                )
                    .toISOString()
                    .trim()
            ),
            __buildDate__: quote(new Date().toISOString()),
            __version__: quote(
                execSync(`git describe --tags --abbrev=0`).toString().trim()
            ),
        }),
        svelte(),
        /* resolve({ browser: true, dedupe: ["svelte"] }), */
        commonjs(),
        yaml(),
    ],
})
