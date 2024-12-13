import { objectEntries, objectKeys, randChoice, randInt } from '../utils';
import { COMMODITIES, Commodity } from './Commodities';
import { MakeStorage } from './storage-template';
import { WORLD_MAP } from './Towns';

import { solveByGaussianElimination, NumberMatrix, NumberVector, prettyPrint, SolutionType, Vector, SparseNumberMatrix } from "@josh-brown/vector";

export type DemandsSupplies<T> = {
    demands: T,
    supplies: T,
};

type IndustryInfo = {
    laborHoursPerProduct: number;
    production: DemandsSupplies<Commodity[]>;
};

export const INDUSTRIES_DEMANDS_SUPPLIES = {
    // "Wagon Shop": {
    //     laborHoursPerProduct: 1,
    //     production: {
    //         demands: ["lumber", "iron", "tools"] as Commodity[],
    //         supplies: [] as Commodity[],
    //     }
    // },
    // "Livestock Auction": {
    //     laborHoursPerProduct: 1,
    //     production: {
    //         demands: ["grain"] as Commodity[],
    //         supplies: [] as Commodity[],
    //     },
    // },
    // "Warehouse": {
    //     laborHoursPerProduct: 1,
    //     production: {
    //         demands: ["tools"] as Commodity[],
    //         supplies: [] as Commodity[],
    //     },
    // },
    // "Refinery": {
    //     laborHoursPerProduct: 5,
    //     production: {
    //         demands: ["tools", "coal"] as Commodity[],
    //         supplies: ["iron", "nickel", "copper"] as Commodity[],
    //     },
    // },
    // "Lumber Mill": {
    //     laborHoursPerProduct: 0.5,
    //     production: {
    //         demands: ["tools"] as Commodity[],
    //         supplies: ["lumber", "lumber"] as Commodity[],
    //     },
    // },
    // "Tavern": {
    //     laborHoursPerProduct: 1,
    //     production: {
    //         demands: ["wine", "spirits", "cheese", "salted meat"] as Commodity[],
    //         supplies: [] as Commodity[],
    //     },
    // },
    "Coal Mine": {
        laborHoursPerProduct: 4,
        production: {
            demands: ["tools"] as Commodity[],
            supplies: ["coal", "coal", "coal", "coal"] as Commodity[],
        },
    },
    "Iron Mine": {
        laborHoursPerProduct: 4,
        production: {
            demands: ["tools"] as Commodity[],
            supplies: ["iron", "iron", "iron"] as Commodity[],
        },
    },
    // "Copper Mine": {
    //     laborHoursPerProduct: 4,
    //     production: {
    //         demands: ["tools"] as Commodity[],
    //         supplies: ["copper"] as Commodity[],
    //     },
    // },
    // "Nickel Mine": {
    //     laborHoursPerProduct: 5,
    //     production: {
    //         demands: ["tools"] as Commodity[],
    //         supplies: ["nickel"] as Commodity[],
    //     },
    // },
    // "Gold Mine": {
    //     laborHoursPerProduct: 2, // per ounce
    //     production: {
    //         demands: ["tools"] as Commodity[],
    //         supplies: ["gold"] as Commodity[],
    //     },
    // },
    "Blacksmith": {
        laborHoursPerProduct: 5,
        production: {
            demands: ["iron", "coal"] as Commodity[],
            supplies: ["tools", "tools"] as Commodity[],
        },
    },
    // "Sheep Farm": {
    //     laborHoursPerProduct: 1,
    //     production: {
    //         demands: [] as Commodity[],
    //         supplies: ["wool"] as Commodity[],
    //     },
    // },
    // "Weaver": {
    //     laborHoursPerProduct: 1.5,
    //     production: {
    //         demands: ["wool", "wool"] as Commodity[],
    //         supplies: ["textiles"] as Commodity[],
    //     },
    // },
    // "Tailor": {
    //     laborHoursPerProduct: 6 * 2, // An article of clothing in 6 hours?
    //     production: {
    //         demands: ["textiles", "textiles", "textiles"] as Commodity[],
    //         supplies: ["clothing", "clothing"] as Commodity[],
    //     },
    // },
    "Farm": {
        laborHoursPerProduct: 52 * 5 * 10 / 1000 / 2, // Assume 1000 bushels grown in 1 year.
        production: {
            demands: ["tools"] as Commodity[],
            supplies: ["grain", "grain", "potatoes"] as Commodity[],
        },
    },
    // "Tobacco Farm": {
    //     laborHoursPerProduct: 52 * 5 * 10 / 1000, // Assume 1000 bushels grown in 1 year.
    //     production: {
    //         demands: ["tools"] as Commodity[],
    //         supplies: ["tobacco"] as Commodity[],
    //     },
    // },
    // "Feed Mill": {
    //     laborHoursPerProduct: 1,
    //     production: {
    //         demands: ["grain"] as Commodity[],
    //         supplies: ["feed"] as Commodity[],
    //     },
    // },
    // "Mill": {
    //     laborHoursPerProduct: 8 / 300, // In 1 8-hour shift, 300lbs produced?
    //     production: {
    //         demands: ["grain"] as Commodity[],
    //         supplies: ["flour"] as Commodity[],
    //     },
    // },
    "Brewery": {
        laborHoursPerProduct: 8, // Assume 2 cases per day?
        production: {
            demands: ["grain", "potatoes"] as Commodity[],
            supplies: ["spirits"] as Commodity[],
        },
    },
    "Wholesale Market": {
        laborHoursPerProduct: 5 * 0.5,
        production: {
            demands: ["flour", "potatoes", "clothing", "tobacco", "spirits"] as Commodity[],
            supplies: ["flour", "potatoes", "clothing", "tobacco", "spirits"] as Commodity[],
        },
    },
    // "Liquor Store": {
    //     laborHoursPerProduct: 0.75,
    //     production: {
    //         demands: ["spirits"] as Commodity[],
    //         supplies: [] as Commodity[],
    //     },
    // },
    // "Winery": {
    //     laborHoursPerProduct: 8 / 1, // Assume 1 case per day?
    //     production: {
    //         demands: [] as Commodity[],
    //         supplies: ["wine", "cheese"] as Commodity[],
    //     },
    // },
    // "Butcher": {
    //     laborHoursPerProduct: 8 / 20, // 20lbs per day
    //     production: {
    //         demands: ["salt"] as Commodity[],
    //         supplies: ["salted meat"] as Commodity[],
    //     },
    // },
    // "Train Station": {
    //     laborHoursPerProduct: 8 * 15, // It takes 15 people 8 hours to bring in and unload a train?
    //     production: {
    //         demands: ["coal"] as Commodity[],
    //         supplies: [
    //             "salt", "sugar", "cheese", "salted meat", "ammunition", "firearms",
    //             "tools", "clothing", "lumber", "wine",
    //         ] as Commodity[],
    //     },
    // },
};

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
        for (let iters = 0; workers > 0 && iters < 100; iters++) {
            const newBusiness = randChoice(objectKeys(INDUSTRIES_DEMANDS_SUPPLIES));
            if (townBusinesses[townName].includes(newBusiness)) continue;
            townBusinesses[townName].push(newBusiness);
            workers -= randInt(50, 250);
        }

        if (!townBusinesses[townName].includes("Wholesale Market")) {
            townBusinesses[townName].unshift("Wholesale Market");
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

type LaborCostMatrixResult =
    | { [comm in Commodity]?: number }
    | { err: "OVERDETERMINED" | "UNDERDETERMINED"; };

export function laborCostOfCommodities(): LaborCostMatrixResult {
    console.time("Labor Costs Computation");

    const commodityIndicies: { [comm in Commodity]?: number } = {};
    const indiciesCommodities: Commodity[] = [];

    function getOrInsertIdx(comm: Commodity): number {
        if (comm in commodityIndicies) {
            return commodityIndicies[comm]!;
        } else {
            const idx = indiciesCommodities.length;
            indiciesCommodities.push(comm);
            return commodityIndicies[comm] = idx;
        }
    }

    const rows: number[][] = [];
    const bArr = [];

    for (const [industry, info] of objectEntries(INDUSTRIES_DEMANDS_SUPPLIES)) {
        let row: number[] = Array.from({ length: indiciesCommodities.length }).map(_ => 0);
        for (const demand of info.production.demands) {
            const idx = getOrInsertIdx(demand);
            row[idx] = (row[idx] ?? 0) - 1;
        }
        for (const supply of info.production.supplies) {
            const idx = getOrInsertIdx(supply);
            row[idx] = (row[idx] ?? 0) + 1;
        }

        rows.push(row);


        bArr.push(-info.laborHoursPerProduct);
    }
    console.log(rows);

    const rowVecs = [];

    // Rectangularize:
    for (const row of rows) {
        const extra = indiciesCommodities.length - row.length;
        const extended = [...row, ...Array.from({ length: extra }).map(_ => 0)];
        rowVecs.push(NumberVector.builder().fromArray(extended));
    }

    const m = SparseNumberMatrix.builder().fromRowVectors(rowVecs);
    const b = NumberVector.builder().fromArray(bArr);

    console.log("M\n", prettyPrint(m));
    console.log("b\n", prettyPrint(b));
    console.log("commodity indicies", indiciesCommodities);
    console.log(`System is ${b.getDimension()} equations in ${rowVecs[0].getDimension()} unknowns.`);

    const soln = solveByGaussianElimination(m, b);

    console.timeEnd("Labor Costs Computation");

    switch (soln.solutionType) {
        case SolutionType.UNIQUE:
            const entries = soln
                .solution
                .toArray()
                .map((cost, commIdx) => [indiciesCommodities[commIdx]!, -cost]);
            return Object.fromEntries(entries);
        case SolutionType.UNDERDETERMINED:
        case SolutionType.OVERDETERMINED:
            console.error("Could not solve production matrix", soln);
            return { err: soln.solutionType as unknown as ("OVERDETERMINED" | "UNDERDETERMINED") };
    }
}