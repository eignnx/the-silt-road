import { MakeStorage } from './storage-template';

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

export const WORLD_MAP = {
    ...MakeStorage({
        resourceKey: "worldMap",
        seedValue: generateWorldMap(),
    }),

    async getTownMapPins(): Promise<TownMapPin[]> {
        return [];
    },

    async getPlayerLocation(): Promise<string> {
        const worldMap = await this.get();
        return worldMap.playerLocation;
    },

    async setPlayerLocation(townName: string) {
        const worldMap = await this.get();
        this.replace({
            ...worldMap,
            playerLocation: townName,
        });
    },
};