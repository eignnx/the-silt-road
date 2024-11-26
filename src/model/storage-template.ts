const APP_KEY = "SILT_ROAD";
const ALL_STORAGE_RESOURCE_KEYS: string[] = [];

export function RESET_ALL_STORAGE() {
    for (const resourceKey of ALL_STORAGE_RESOURCE_KEYS) {
        localStorage.removeItem(resourceKey);
    }
}

export function MakeStorage<T>(
    { resourceKey, seedValue }:
        { resourceKey: string; seedValue: T; }
) {
    const object = {
        resourceKey,
        seedValue,

        async get(): Promise<T> {
            const retreival = localStorage.getItem(`${APP_KEY}:${this.resourceKey}`);
            if (retreival !== null) {
                return JSON.parse(retreival) as T;
            } else {
                this.replace(this.seedValue);
                return this.seedValue;
            }
        },

        async replace(newData: T) {
            localStorage.setItem(
                `${APP_KEY}:${this.resourceKey}`,
                JSON.stringify(newData),
            );
        }
    };

    object.replace(seedValue);
    ALL_STORAGE_RESOURCE_KEYS.push(resourceKey);

    return object;
}
