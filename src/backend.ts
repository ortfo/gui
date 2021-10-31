import type { Settings } from "./stores"

type Backend = {
    initializeConfigurationDirectory: () => Promise<void>;
    settingsRead: () => Promise<Settings>;
    settingsWrite: (settings: Settings) => Promise<void>;
    quit: () => Promise<void>;
}

export const backend: Backend = {
    initializeConfigurationDirectory: async () => { return await backend__initializeConfigurationDirectory() },
    settingsRead: async () => { return await backend__settingsRead()},
    settingsWrite: async (settings: Settings) => { return await backend__settingsWrite(settings)},
    quit: async () => { return await backend__quit()},
}
