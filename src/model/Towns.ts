const RESOURCE_KEY = `SILT_ROAD:town`;

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
        ]
    };
}

async function getWorldMap(): Promise<WorldMap> {
    const fetched = localStorage.getItem(RESOURCE_KEY);
    return JSON.parse(fetched ?? JSON.stringify(generateWorldMap()));
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

    async setPlayerPos(pos: string) {
        const worldMap = await getWorldMap();
        replaceWorldMap({
            ...worldMap,
            playerLocation: pos,
        });
    }
};