import * as backendFunctions from "./backend.generated"
/*
 * Strings that represent binary files, with a filetype at the start.
 * Can be used in [src] attributes of images, for example.
 * Example:
 *
 *      data:image/webp;base64,gAaA...
 */
export type Base64WithFiletype = string

export type DirEntry = {
    name: string
    type: string
    info: Object
    isdir: boolean
}

export type MaybeError = string | null

export type BuildProgress = {
    works_done: number
    works_total: number
    work_id: string
    phase: string
    details: string[]
}

export type PickFileConstraint = {
    accept: "directory" | "*" | `.${string}`
}

let FILESERVER_PORT

export const localProjects = path =>
    `http://localhost:${FILESERVER_PORT}/projects/${path}`
export const localDatabase = path =>
    `http://localhost:${FILESERVER_PORT}/database/${path}`
export const relativeToDatabase = path => path.split("portfolio-database/")[1]

export const backend = backendFunctions
