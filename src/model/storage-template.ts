const APP_KEY = "SILT_ROAD";
const ALL_STORAGE_RESOURCE_KEYS: string[] = [];

export function RESET_ALL_STORAGE() {
    for (const resourceKey of ALL_STORAGE_RESOURCE_KEYS) {
        localStorage.removeItem(resourceKey);
    }
}

export function MakeStorage<T>(
    {
        resourceKey,
        seedValue,
    }:
        {
            resourceKey: string;
            seedValue: T | Promise<T>;
        }
) {
    const object = {
        resourceKey,
        seedValue,

        async get(): Promise<T> {
            const retreival = localStorage.getItem(`${APP_KEY}:${this.resourceKey}`);
            if (retreival !== null) {
                return JSON.parse(retreival) as T;
            } else {
                if (seedValue instanceof Promise) {
                    await this.replace(await this.seedValue);
                } else {
                    await this.replace(this.seedValue as T);
                }
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

    if (seedValue instanceof Promise) {
        // This is scary. I wish we had top-level await
        seedValue.then(async seed => await object.replace(seed));
    } else {
        object.replace(seedValue);
    }

    ALL_STORAGE_RESOURCE_KEYS.push(resourceKey);

    return object;
}
