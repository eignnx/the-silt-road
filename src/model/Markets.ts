import { randChoice } from '../utils';
import { COMMODITIES, Commodity, commodityBasePrice1860, Inventory, UnitPriceSummary } from './Commodities';
import { WORLD_MAP } from './Towns';
import { genHumanFirstName, genHumanLastName } from '../gen/names';
import { MakeStorage } from './storage-template';

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

export const MARKETS = {
    ...MakeStorage({
        resourceKey: "markets",
        seedValue: DEFAULT_MARKETS(),
    }),


    async getMarket(town: string): Promise<Market> {
        const markets = await this.get();
        const market = markets[town];
        if (market !== undefined)
            return market;
        else
            throw new Error(`Unknown town name '${town}'`);
    },

    async replaceMarket(town: string, newMarket: Market): Promise<Market> {
        this.replace({
            ... await this.get(),
            [town]: newMarket
        });
        return newMarket;
    },

    async updateMarket(town: string, updates: Market): Promise<Market> {
        const market = await this.getMarket(town);
        Object.assign(market, updates);
        return await this.replaceMarket(town, market);
    },

    async updateMarketInventory(town: string, updates: Inventory): Promise<Market> {
        const market = await this.getMarket(town);
        Object.assign(market.inventory, updates);
        await this.replaceMarket(town, market);
        return market;
    },

    /**
     * 
     * @param change A mapping from Commodities to signed integers representing a
     *               change in inventory.
     * @returns 
     */
    async changeMarketInventory(town: string, change: Inventory): Promise<Market> {
        const market = await this.getMarket(town);
        for (const [commKey, qtyDelta] of Object.entries(change)) {
            const comm = commKey as Commodity;
            const onHandQty = market.inventory[comm] ?? 0;
            if (onHandQty + qtyDelta < 0) {
                throw new Error(`Cannot reduce inventory below 0.`);
            }
            market.inventory[comm] = onHandQty + qtyDelta;
        }
        await this.replaceMarket(town, market);
        return market;
    },
};

