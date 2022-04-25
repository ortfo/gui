import type { Translated } from "./ortfo"
import { getNotificationsContext } from "svelte-notifications"

export const transformKeys =
    (transformer: (input: string) => string) => (obj: any) => {
        if (Array.isArray(obj)) {
            return obj.map(transformKeys(transformer))
        }
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
export const lowercaseFirstCharacter = transformKeys(
    key => key[0].toLowerCase() + key.slice(1)
)

export const uppercaseFirstCharacter = (s: string) =>
    s[0].toUpperCase() + s.slice(1)

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

export function pick<T extends object, K extends keyof T>(
    base: T,
    ...keys: K[]
): Pick<T, K> {
    const entries = keys.map(key => [key, base[key]])
    return Object.fromEntries(entries)
}

export function lcm(...integers: number[]): number {
    if (integers.length === 0) {
        return 0
    }
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

export function logExpr(expr) {
    console.log("<<<LOG EXPR>>> ", expr)
    return expr
}

export const noSpaces = s => s.replace(" ", "-")

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

export function unslug(slug: string): string {
    return uppercaseFirstCharacter(slug.replace(/-/g, " ")).trim()
}

export function sortObject<T>(
    compare: (a: T, b: T) => number
): (obj: { [k: string]: T }) => { [k: string]: T } {
    return obj =>
        Object.keys(obj)
            .sort((a, b) => compare(obj[a], obj[b]))
            .reduce((result, key) => {
                result[key] = obj[key]
                return result
            }, {})
}

export function closestTo(target: number, values: number[]): number {
    return values.reduce((prev, curr) =>
        Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    )
}

export const timeToRead = (text: string) =>
    text.split(" ").length *
    (1 / (200 / 60)) /* average reading speed: 200 words·min⁻¹ */

export function createNotificationSpawner() {
    const context = getNotificationsContext()
    if (context === undefined)
        return {
            add: (text: string) => {},
            error: (text: string) => {},
            warn: (text: string) => {},
            success: (text: string) => {},
            remove: (...notificationIDs: string[]) => {},
            clear: () => {},
        }
    const position = "bottom-center"

    return {
        add: (text: string) =>
            context.addNotification({
                removeAfter: timeToRead(text) + 3000,
                position,
                text,
            }),
        error: (text: string) =>
            context.addNotification({
                removeAfter: timeToRead(text) + 3000,
                position,
                text,
                type: "danger",
            }),
        warn: (text: string) =>
            context.addNotification({
                removeAfter: timeToRead(text) + 3000,
                position,
                text,
                type: "warning",
            }),
        success: (text: string) =>
            context.addNotification({
                removeAfter: timeToRead(text) + 3000,
                position,
                text,
                type: "success",
            }),
        remove: (...notificationIDs: string[]) =>
            notificationIDs.forEach(notificationID =>
                context.removeNotification(notificationID)
            ),
        clear: () => context.clearNotifications(),
    }
}

export async function sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

export function objectMapValues<I, O>(
    obj: { [key: string]: I },
    fn: (value: I) => O
): { [key: string]: O } {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, fn(value)])
    )
}
