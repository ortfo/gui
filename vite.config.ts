import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import globals from "rollup-plugin-node-globals"

export default defineConfig({
    plugins: [
        svelte(),
        resolve({ browser: true, dedupe: ["svelte"] }),
        commonjs(),
        { ...globals(), name: "globals" },
    ],
})
