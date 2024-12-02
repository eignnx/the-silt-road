import { objectKeys, randChoice, randInt } from '../utils';
import { Commodity } from './Commodities';
import { MakeStorage } from './storage-template';
import { WORLD_MAP } from './Towns';

export type DemandsSupplies<T> = {
    demands: T,
    supplies: T,
};

export const INDUSTRIES_DEMANDS_SUPPLIES = {
    "Wagon Shop": {
        demands: ["lumber", "iron", "tools"],
        supplies: [],
    },
    "Livestock Auction": {
        demands: ["grain"],
        supplies: [],
    },
    "Warehouse": {
        demands: [],
        supplies: [],
    },
    "Refinery": {
        demands: ["tools", "coal"],
        supplies: ["iron", "nickel", "copper"],
    },
    "Lumber Mill": {
        demands: ["tools"],
        supplies: ["lumber"],
    },
    "Tavern": {
        demands: ["wine", "spirits", "cheese", "salted meat"],
        supplies: [],
    },
    "Coal Mine": {
        demands: ["tools"],
        supplies: ["coal"],
    },
    "Iron Mine": {
        demands: ["tools"],
        supplies: ["iron"],
    },
    "Copper Mine": {
        demands: ["tools"],
        supplies: ["copper"],
    },
    "Nickel Mine": {
        demands: ["tools"],
        supplies: ["nickel"],
    },
    "Gold Mine": {
        demands: ["tools"],
        supplies: ["gold"],
    },
    "Blacksmith": {
        demands: ["iron", "coal"],
        supplies: ["tools"],
    },
    "Weaver": {
        demands: ["wool"],
        supplies: ["textiles"],
    },
    "Tailor": {
        demands: ["textiles"],
        supplies: ["clothing"],
    },
    "Farm": {
        demands: ["tools"],
        supplies: ["grain", "potatoes"],
    },
    "Feed Mill": {
        demands: ["grain"],
        supplies: ["feed"],
    },
    "Mill": {
        demands: ["grain"],
        supplies: ["flour"],
    },
    "Brewery": {
        demands: ["grain", "potatoes"],
        supplies: ["spirits"],
    },
    "Winery": {
        demands: [],
        supplies: ["wine", "cheese"],
    },
    "Butcher": {
        demands: ["salt"],
        supplies: ["salted meat"],
    },
    "Train Station": {
        demands: ["coal"],
        supplies: [
            "salt", "sugar", "cheese", "salted meat", "ammunition", "firearms",
            "tools", "clothing", "lumber", "wine",
        ],
    },
} as const;

export type Business = keyof typeof INDUSTRIES_DEMANDS_SUPPLIES;

export type TownBusinesses = { [town: string]: Business[]; };

async function DEFAULT(): Promise<TownBusinesses> {
    console.log("GENERATING TOWN BUSINESSES");
    const townBusinesses: TownBusinesses = {};
    const townMapPins = await WORLD_MAP.getTownMapPins();
    for (const townName of townMapPins.map(town => town.name)) {
        townBusinesses[townName] = [];
        const population = randInt(100, 2000);
        let workers = 0.40 * population; // Assume 40% of population works.
        while (workers > 0) {
            const newBusiness = randChoice(objectKeys(INDUSTRIES_DEMANDS_SUPPLIES));
            if (townBusinesses[townName].includes(newBusiness)) continue;
            townBusinesses[townName].push(newBusiness);
            workers -= randInt(50, 250);
        }
    }
    return townBusinesses;
}

export const TOWN_BUSINESSES = {
    ...MakeStorage({
        resourceKey: "industries",
        seedValue: DEFAULT(),
    }),
};