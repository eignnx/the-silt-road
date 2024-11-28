const RESOURCE_KEY = `SILT_ROAD:worldMap`;

export type TownMapPin = {
    name: string;
    coords: { x: number, y: number; };
};

export type WorldMap = {
    playerLocation: string,
    towns: TownMapPin[];
};


function generateWorldMap(): WorldMap {
    return {
        playerLocation: "Rattsville",
        towns: [
            { name: "Rattsville", coords: { x: 50, y: 50 } },
            { name: "Fodder Crick", coords: { x: 7, y: 30 } },
            { name: "Damnation", coords: { x: 50, y: 90 } },
            { name: "Cornucopia Falls", coords: { x: 15, y: 70 } },
            { name: "Langston", coords: { x: 95, y: 20 } },
            { name: "Buzzard's Gulch", coords: { x: 35, y: 65 } },
            { name: "Slag Hill", coords: { x: 20, y: 75 } },
            { name: "Ambrose", coords: { x: 45, y: 85 } },
            { name: "Whitinicky", coords: { x: 55, y: 15 } },
        ]
    };
}

async function getWorldMap(): Promise<WorldMap> {
    const fetched = localStorage.getItem(RESOURCE_KEY);
    if (fetched !== null)
        return JSON.parse(fetched);
    else
        return await replaceWorldMap(generateWorldMap());
}

async function replaceWorldMap(newWorldMap: WorldMap): Promise<WorldMap> {
    localStorage.setItem(RESOURCE_KEY, JSON.stringify(newWorldMap));
    return newWorldMap;
}


export const WORLD_MAP = {
    async getWorldMap(): Promise<WorldMap> {
        return await getWorldMap();
    },

    async getTownMapPins(): Promise<TownMapPin[]> {
        return [];
    },

    async getPlayerLocation(): Promise<string> {
        const worldMap = await getWorldMap();
        return worldMap.playerLocation;
    },

    async setPlayerLocation(townName: string) {
        const worldMap = await getWorldMap();
        replaceWorldMap({
            ...worldMap,
            playerLocation: townName,
        });
    },
};