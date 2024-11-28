import { Commodity, commodityBasePrice1860 } from './Commodities';
import { MARKETS, marketPrice } from './Markets';
import { PLAYER_INVENTORY } from './PlayerInventory';

const RESOURCE_KEY = "SILT_ROAD:tradeLedger";

export type TradeLedger = {
    // If I bought 100 apples in one town for $1 each, and 100 apples in another
    // town for $3 each, we'll store the weighted average price or $2/apple.
    inventoryAvgPrices: {
        [comm in Commodity]?: {
            price: number,
            qty: number,
        }
    };
    townVisits: {
        [townName: string]: TownVisit;
    };
};

export type TownVisit = {
    lastVisitedDate: number,
    marketSnapshot: MarketSnapshot,
};

export type MarketSnapshot = {
    [comm in Commodity]?: {
        unitPrice: number,
        qtyOnHand: number,
    }
};


async function DEFAULT(): Promise<TradeLedger> {
    const inventoryAvgPrices = {} as { [comm in Commodity]?: { price: number, qty: number; } };

    const inv = await PLAYER_INVENTORY.get();

    for (const commKey in inv) {
        const comm = commKey as Commodity;
        inventoryAvgPrices[comm] = {
            price: commodityBasePrice1860(comm),
            qty: inv[comm]!,
        };
    }

    return {
        inventoryAvgPrices,
        townVisits: {},
    };
    ;
}

async function load(): Promise<TradeLedger> {
    const retrieval = localStorage.getItem(RESOURCE_KEY);
    if (retrieval !== null) {
        return JSON.parse(retrieval);
    } else {
        return await replace(await DEFAULT());
    }
}

async function replace(ledger: TradeLedger): Promise<TradeLedger> {
    localStorage.setItem(RESOURCE_KEY, JSON.stringify(ledger));
    return ledger;
}

export const TRADE_LEDGER = {

    async load(): Promise<TradeLedger> {
        return await load();
    },

    async recordTownVisit(town: string, currentDate: number) {
        const ledger = await load();

        const marketSnapshot: MarketSnapshot = {};
        const market = await MARKETS.getMarket(town);

        for (const commKey in market.inventory) {
            const comm = commKey as Commodity;
            marketSnapshot[comm] = {
                unitPrice: marketPrice(market, comm).unitPrice,
                qtyOnHand: market.inventory[comm]!,
            };
        }

        ledger.townVisits[town] = {
            lastVisitedDate: currentDate,
            marketSnapshot,
        };

        await replace(ledger);
    },

    /**
     * 
     * @param txn A negative `qty` means player is selling, positive meanse player is purchasing.
     */
    async recordTransaction(txn: { [comm in Commodity]?: { qty: number, price: number; } }) {
        const ledger = await load();

        for (const commKey in txn) {
            const comm = commKey as Commodity;
            const { qty, price } = txn[comm]!;

            if (qty === 0) {
                return;
            } else if (qty < 0) {
                // Negative qty means player is selling.
                await recordSale(ledger, comm, qty);
            } else {
                // Positive qty means player is purchasing.
                await recordPurchase(ledger, comm, price, qty);
            }
        }

        await replace(ledger);
    },
};


async function recordPurchase(ledger: TradeLedger, comm: Commodity, price: number, qty: number) {
    const oldAvg = ledger.inventoryAvgPrices[comm] ?? { price: 0, qty: 0 };

    const totalCost = price * qty + oldAvg.price * oldAvg.qty;
    const totalQty = qty + oldAvg.qty;
    const newAvgPrice = totalCost / totalQty;

    ledger.inventoryAvgPrices[comm] = {
        price: newAvgPrice,
        qty: totalQty
    };
}

async function recordSale(ledger: TradeLedger, comm: Commodity, qty: number) {
    const oldAvg = ledger.inventoryAvgPrices[comm];

    if (oldAvg !== undefined) {
        oldAvg.qty -= qty;
    } else {
        // Dunno how you sold something you never purchased but...
        ledger.inventoryAvgPrices[comm] = { price: 0, qty: 0 };
    }
}