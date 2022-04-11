/// <reference types="vitest" />
import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import yaml from "@rollup/plugin-yaml"

export default defineConfig({
    plugins: [
        svelte(),
        resolve({ browser: true, dedupe: ["svelte"] }),
        commonjs(),
        yaml(),
    ],
})
