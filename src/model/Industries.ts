import { objectKeys, randChoice, randInt } from '../utils';
import { Commodity } from './Commodities';
import { MakeStorage } from './storage-template';
import { WORLD_MAP } from './Towns';

type DemandsSupplies<T> = {
    demands: T[],
    supplies: T[],
};

export const INDUSTRIES_DEMANDS_SUPPLIES = {
    "Wagon Shop": {
        demands: ["lumber", "iron"],
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
        demands: ["heavy machinery", "coal"],
        supplies: ["iron", "nickel", "copper"],
    },
    "Lumber Mill": {
        demands: ["heavy machinery"],
        supplies: ["lumber"],
    },
    "Tavern": {
        demands: ["wine", "spirits", "cheese", "salted meat"],
        supplies: [],
    },
    "Coal Mine": {
        demands: ["heavy machinery"],
        supplies: ["coal"],
    },
    "Iron Mine": {
        demands: ["heavy machinery"],
        supplies: ["iron"],
    },
    "Copper Mine": {
        demands: ["heavy machinery"],
        supplies: ["copper"],
    },
    "Nickel Mine": {
        demands: ["heavy machinery"],
        supplies: ["nickel"],
    },
    "Gold Mine": {
        demands: ["heavy machinery"],
        supplies: ["gold"],
    },
    "Blacksmith": {
        demands: ["iron"],
        supplies: ["heavy machinery"],
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
        demands: ["heavy machinery"],
        supplies: ["grain", "potatoes"],
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
            "heavy machinery", "clothing", "lumber", "wine",
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
            townBusinesses[townName].push(randChoice(objectKeys(INDUSTRIES_DEMANDS_SUPPLIES)));
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