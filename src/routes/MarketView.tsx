import { useLoaderData } from 'react-router-dom';
import { COMMODITIES, Commodity, Inventory } from '../model/Commodities';
import { Market, MARKETS } from '../model/Markets';
import { PLAYER_INVENTORY } from '../model/PlayerInventory';

import '../styles/MarketView.css';
import { BANK, PLAYER_ACCT } from '../model/BankAcct';
import { PLAYER_INFO, PlayerInfo } from '../model/PlayerInfo';
import { WORLD_MAP } from '../model/Towns';
import BillOfSale from '../components/BillOfSale';
import TradeLedger from '../components/TradeLedger';
import { TRADE_LEDGER, TradeLedger as TradeLedgerData } from '../model/TradeLedger';
import { useState } from 'react';


export type MarketViewLoaderData = {
    playerInventory: Inventory;
    currentTown: string,
    market: Market;
    playerBankBalance: number;
    playerInfo: PlayerInfo;
    tradeLedger: TradeLedgerData;
};

export async function marketViewLoader(): Promise<MarketViewLoaderData> {
    return {
        market: await MARKETS.getMarket(await WORLD_MAP.getPlayerLocation()),
        currentTown: await WORLD_MAP.getPlayerLocation(),
        playerInventory: await PLAYER_INVENTORY.get(),
        playerBankBalance: await BANK.getAcctBalance(PLAYER_ACCT),
        playerInfo: await PLAYER_INFO.get(),
        tradeLedger: await TRADE_LEDGER.load(),
    };
}

export async function marketViewAction({ request }: { request: Request; }) {
    const { currentTxn, totalBill, currentTown } = await request.json();

    const playerInvUpdates: Inventory = {};
    const marketInvUpdates: Inventory = {};

    for (const [commKey, qtyStr] of Object.entries(currentTxn)) {
        const comm = commKey as Commodity;
        const qty = +(qtyStr as string);
        playerInvUpdates[comm] = +qty;
        marketInvUpdates[comm] = -qty;
    }

    try {
        if (totalBill > 0) {
            await BANK.transfer(PLAYER_ACCT, BANK.SINK, Math.abs(totalBill));
        } else {
            await BANK.transfer(BANK.SOURCE, PLAYER_ACCT, Math.abs(totalBill));
        }
    } catch (e) {
        if ((e as Error).message === "INSUFFICIENT FUNDS") {
            return null;
        } else {
            throw e;
        }
    }

    console.log("playerInventoryUpdates", playerInvUpdates);
    await PLAYER_INVENTORY.addToPlayerInventory(playerInvUpdates);
    console.log("marketInventoryUpdates", marketInvUpdates);
    await MARKETS.changeMarketInventory(currentTown, marketInvUpdates);

    return null;
}

export default function MarketView() {
    const { market, currentTown, playerInventory, tradeLedger } = useLoaderData() as MarketViewLoaderData;
    const [currentTxn, setCurrentTxn] = useState<Inventory>({});

    const orderedInventories = computeOrderedInventories(playerInventory, market, currentTxn);
    const orderedCommodities = orderedInventories.flatMap(row => (
        (row.marketQty || row.playerQty) ? [row.comm] : []
    ));

    const townVisitCount = Object.keys(tradeLedger.townVisits).length;

    return (<>
        <h1>Market</h1>
        <h2>{currentTown}</h2>
        <h3>{market.name}</h3>
        <section id="billofsale-and-tradeledger">
            <BillOfSale
                orderedInventories={orderedInventories}
                currentTxn={currentTxn}
                setCurrentTxn={setCurrentTxn}
            />
            {townVisitCount > 0 && <TradeLedger
                orderedCommodities={orderedCommodities}
            />}
        </section>
    </>);
};


export type InventoryCmpRow = { comm: Commodity, playerQty?: number, marketQty?: number; };

export function computeOrderedInventories(playerInventory: Inventory, market: Market, currentTxn: Inventory): InventoryCmpRow[] {
    const orderedInventories: InventoryCmpRow[] = [];

    for (const comm of COMMODITIES) {
        const txnQty = currentTxn[comm] ?? 0;

        let playerQty;
        let marketQty;
        if (txnQty < 0) {
            playerQty = (playerInventory[comm] ?? 0) + txnQty;
            marketQty = (market.inventory[comm] ?? 0);
        } else {
            playerQty = (playerInventory[comm] ?? 0);
            marketQty = (market.inventory[comm] ?? 0) - txnQty;
        }

        orderedInventories.push({
            comm,
            playerQty: playerQty > 0 ? playerQty : undefined,
            marketQty: marketQty > 0 ? marketQty : undefined,
        });
    }

    // Sort inventory by commodity name:
    orderedInventories.sort((a, b) => a.comm.localeCompare(b.comm));

    return orderedInventories;
}
