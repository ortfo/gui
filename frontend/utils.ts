export const transformKeys =
    (transformer: (input: string) => string) => (obj: any) => {
        if (Object.prototype.toString.call(obj) !== "[object Object]") {
            return obj
        }
        const newObj = {}
        for (const [key, value] of Object.entries(obj)) {
            newObj[transformer(key)] = Array.isArray(value)
                ? value.map(transformKeys(transformer))
                : Object.prototype.toString.call(value) === "[object Object]"
                ? transformKeys(transformer)(value)
                : value
        }

        return newObj
    }

export const lowercaseKeys = transformKeys(key => key.toLowerCase())
export const noSpacesKeys = transformKeys(key => key.replace(/\s/g, ""))
export const lowercaseNoSpacesKeys = transformKeys(key =>
    key.replace(/\s/g, "").toLowerCase()
)

export const range = (start: number, end: number) =>
    [...Array(end - start).keys()].map(i => i + start)

export const repeat = (n: number, value: any) => range(0, n).map(() => value)

export function completeWith<V>(n: number, value: V, arr: V[]): V[] {
    return [...arr, ...repeat(n - arr.length, value)]
}

export function except<V>(
    ...keys: string[]
): (obj: { [key: string]: V }) => { [key: string]: V } {
    return obj =>
        Object.fromEntries(
            Object.entries(obj).filter(([key]) => !keys.includes(key))
        )
}
