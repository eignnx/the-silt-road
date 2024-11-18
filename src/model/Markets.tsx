import { COMMODITIES, Commodity, commodityBasePrice1860, Inventory, UnitPriceSummary } from './Commodities';

export interface Market {
    inventory: Inventory;
    priceDeviations: PriceDeviations;
}

export type PriceDeviations = {
    [comm in Commodity]: number;
};

export function generateMarket(): Market {
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

    return { inventory, priceDeviations };
}

export function marketPrice(market: Market, comm: Commodity): UnitPriceSummary {
    return UnitPriceSummary
        .basePrice1860(comm)
        .deviate(market.priceDeviations[comm]);
}

const DEFAULT_MARKET: Market = generateMarket();

export async function getMarket(): Promise<Market> {
    const retrieval = localStorage.getItem(`SILT_ROAD:market`) ?? JSON.stringify(DEFAULT_MARKET);
    return JSON.parse(retrieval);
}

export async function updateMarket(updates: Market): Promise<Market> {
    const market = await getMarket();
    Object.assign(market, updates);
    localStorage.setItem(`SILT_ROAD:market`, JSON.stringify(market));
    return market;
}

export async function changeMarketInventory(comm: Commodity, qty: number): Promise<Market> {
    const market = await getMarket();
    const onHandQty = market.inventory[comm] ?? 0;
    if (onHandQty + qty < 0) {
        throw new Error(`Cannot reduce inventory below 0.`);
    }
    market.inventory[comm] = onHandQty + qty;
    localStorage.setItem(`SILT_ROAD:market`, JSON.stringify(market));
    return market;
}