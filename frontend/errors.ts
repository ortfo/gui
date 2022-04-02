export interface OrtfoError extends Error {
    why: "missing_work" | null
}

export function MissingWork(message: string): OrtfoError {
    let error = Error(message) as OrtfoError
    error.why = "missing_work"
    return error
}
