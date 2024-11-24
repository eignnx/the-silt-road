import { useLoaderData } from 'react-router-dom';
import { Commodity, Inventory } from '../model/Commodities';
import { changeMarketInventory, getMarket, Market } from '../model/Markets';
import { addToPlayerInventory as changePlayerInventory, getPlayerInventory } from '../model/PlayerInventory';

import '../styles/MarketView.css';
import { BANK, PLAYER_ACCT } from '../model/BankAcct';
import { PLAYER_INFO, PlayerInfo } from '../model/PlayerInfo';
import { WORLD_MAP } from '../model/Towns';
import BillOfSale from '../components/BillOfSale';


export type MarketViewLoaderData = {
    playerInventory: Inventory;
    currentTown: string,
    market: Market;
    playerBankBalance: number;
    playerInfo: PlayerInfo;
};

export async function marketViewLoader(): Promise<MarketViewLoaderData> {
    const currentTown = await WORLD_MAP.getPlayerLocation();
    return {
        playerInventory: getPlayerInventory(),
        market: await getMarket(currentTown),
        currentTown,
        playerBankBalance: await BANK.getAcctBalance(PLAYER_ACCT),
        playerInfo: await PLAYER_INFO.getPlayerInfo(),
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

    changePlayerInventory(playerInvUpdates);
    await changeMarketInventory(currentTown, marketInvUpdates);


    return null;
}

export default function MarketView() {
    const { market, currentTown } = useLoaderData() as MarketViewLoaderData;

    return (<>
        <h1>Market</h1>
        <h2>{currentTown}</h2>
        <h3>{market.name}</h3>
        <BillOfSale />
    </>);
};