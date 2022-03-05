import type { Translated } from "./ortfo"

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

export const first = <T>(arr: T[]) => arr[0]
export const second = <T>(arr: T[]) => arr[1]

/**
 * @returns max(arr) - min(arr)
 */
export const distance = (arr: number[]) => Math.max(...arr) - Math.min(...arr)

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

export function lcm(...integers: number[]): number {
    if (integers.length < 2) {
        return integers[0]
    }
    let greater = integers[0]
    // choose the greater number
    if (integers[0] > integers[1]) {
        greater = integers[0]
    } else {
        greater = integers[1]
    }

    while (true) {
        if (greater % integers[0] == 0 && greater % integers[1] == 0) {
            break
        }
        greater += 1
    }
    if (integers.length == 2) {
        return greater
    }
    return lcm(greater, ...integers.slice(2))
}

export function mapToTranslated<I, O>(
    map: (item: I) => O,
    data: Translated<I[]>
): Translated<O[]> {
    return Object.fromEntries(
        Object.entries(data).map(([lang, data]) => [lang, data.map(map)])
    )
}

export async function mapToTranslatedAsync<I, O>(
    map: (item: I) => Promise<O>,
    data: Translated<I[]>
): Promise<Translated<O[]>> {
    const output = {}
    for (const [language, items] of Object.entries(data)) {
        output[language] = await Promise.all(items.map(map))
    }
    return output
}
