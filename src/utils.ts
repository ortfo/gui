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
