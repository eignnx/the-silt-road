import { randChoice } from '../utils';
import { COMMODITIES, Commodity, commodityBasePrice1860, Inventory, UnitPriceSummary } from './Commodities';
import { WORLD_MAP } from './Towns';
import { genHumanFirstName, genHumanLastName } from '../gen/names';

const RESOURCE_KEY = `SILT_ROAD:markets`;

export type AllMarkets = {
    [townName: string]: Market;
};

export interface Market {
    name: string,
    inventory: Inventory;
    priceDeviations: PriceDeviations;
}

export type PriceDeviations = {
    [comm in Commodity]: number;
};

export function generateMarket(town: string): Market {
    const inventory: Inventory = {};
    const priceDeviations: PriceDeviations = {} as PriceDeviations;

    // For each commodity, there's a chance that it's not available at this
    // market. If it is, generate the total value of this market's stock of that
    // commodity, and use that to determine how many units are available.
    for (const comm of COMMODITIES) {
        // Randomly generate a price deviation for this commodity.
        // Between -10% and +10%.
        let deviation = Math.random();
        deviation *= deviation * deviation; // Bias towards smaller values.
        deviation = deviation * 2 - 1; // Between -1 and 1.
        deviation *= 0.30; // Between -30% and 30%.
        priceDeviations[comm] = deviation;

        // 65% chance that this commodity is NOT available.
        if (Math.random() < 0.65) {
            continue;
        }

        let totalValue = Math.random();
        totalValue *= totalValue * totalValue; // Bias towards smaller values.
        totalValue *= 995.00; // Max value of $1000.
        totalValue += 5.00; // Min value of $5.

        const baseUnitPrice = commodityBasePrice1860(comm);
        const onHandQty = Math.floor(totalValue / baseUnitPrice);
        inventory[comm] = onHandQty;

    }

    let marketName = randChoice(
        (town.length < 12)
            ? [
                `Markets at ${town}`,
                `${town} General Market`,
                `${town} Plaza`,
                `${town} Co-Op.`,
                `${town}'s Market`,
                `${town}'s Trade Goods`,
                `Traders at ${town}`,
            ]
            : [
                `${genHumanLastName()} ${randChoice([
                    " & Son's",
                    "'s Market",
                    "'s Trade Goods",
                ])}`,
                `Trader ${genHumanFirstName()}'s`
            ]
    );

    return { name: marketName, inventory, priceDeviations };
}

export function marketPrice(market: Market, comm: Commodity): UnitPriceSummary {
    return UnitPriceSummary
        .basePrice1860(comm)
        .deviate(market.priceDeviations[comm]);
}

async function DEFAULT_MARKETS(): Promise<AllMarkets> {
    const worldMap = await WORLD_MAP.getWorldMap();
    const markets: AllMarkets = {};
    for (const town of worldMap.towns) {
        markets[town.name] = generateMarket(town.name);
    }
    return markets;
}

export async function getMarkets(): Promise<AllMarkets> {
    const retrieval = localStorage.getItem(RESOURCE_KEY);
    if (retrieval !== null)
        return JSON.parse(retrieval);
    else {
        return await replaceMarkets(await DEFAULT_MARKETS());
    }
}

export async function replaceMarkets(newMarkets: AllMarkets): Promise<AllMarkets> {
    localStorage.setItem(RESOURCE_KEY, JSON.stringify(newMarkets));
    return newMarkets;
}

export async function getMarket(town: string): Promise<Market> {
    const markets = await getMarkets();
    const market = markets[town];
    if (market !== undefined)
        return market;
    else
        throw new Error(`Unknown town name '${town}'`);
}

async function setMarket(town: string, newMarket: Market): Promise<Market> {
    localStorage.setItem(RESOURCE_KEY, JSON.stringify({
        ... await getMarkets(),
        [town]: newMarket
    }));
    return newMarket;
}

export async function updateMarket(town: string, updates: Market): Promise<Market> {
    const market = await getMarket(town);
    Object.assign(market, updates);
    return await setMarket(town, market);
}

export async function updateMarketInventory(town: string, updates: Inventory): Promise<Market> {
    const market = await getMarket(town);
    Object.assign(market.inventory, updates);
    await setMarket(town, market);
    return market;
}

/**
 * 
 * @param change A mapping from Commodities to signed integers representing a
 *               change in inventory.
 * @returns 
 */
export async function changeMarketInventory(town: string, change: Inventory): Promise<Market> {
    const market = await getMarket(town);
    for (const [commKey, qtyDelta] of Object.entries(change)) {
        const comm = commKey as Commodity;
        const onHandQty = market.inventory[comm] ?? 0;
        if (onHandQty + qtyDelta < 0) {
            throw new Error(`Cannot reduce inventory below 0.`);
        }
        market.inventory[comm] = onHandQty + qtyDelta;
    }
    await setMarket(town, market);
    return market;
}