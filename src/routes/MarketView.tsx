import { useFetcher, useLoaderData } from 'react-router-dom';
import { Commodity, Inventory } from '../model/Commodities';
import { changeMarketInventory, getMarket, Market, marketPrice } from '../model/Markets';
import { addToPlayerInventory, getPlayerInventory } from '../model/PlayerInventory';

import '../styles/MarketView.css';
import { titleCase } from '../utils';

type MarketViewLoaderData = {
    playerInventory: Inventory;
    market: Market;
};

export async function marketViewLoader() {
    return {
        playerInventory: getPlayerInventory(),
        market: await getMarket()
    };
}

export async function marketViewAction({ request }: { request: Request; }) {
    const formData = await request.formData();
    const { _action, ...updates } = Object.fromEntries(formData.entries());
    switch (_action) {
        case 'sell': {
            await changeMarketInventory(updates.commodityKind as Commodity, +1);
            addToPlayerInventory({
                [updates.commodityKind as Commodity]: -1
            });
            return null;
        }
        case 'buy': {
            await changeMarketInventory(updates.commodityKind as Commodity, -1);
            addToPlayerInventory({
                [updates.commodityKind as Commodity]: +1
            });
            return null;
        }
        default:
            throw new Error(`Invalid action: ${_action}`);
    }
}

export default function MarketView() {
    const { playerInventory, market } = useLoaderData() as MarketViewLoaderData;
    const fetcher = useFetcher();

    type OrderedInventories = {
        common: { [comm in Commodity]: { player: number, market: number; } };
        playerOnly: { [comm in Commodity]: number };
        marketOnly: { [comm in Commodity]: number };
    };

    const orderedInventories: OrderedInventories = {
        common: {} as any,
        playerOnly: {} as any,
        marketOnly: {} as any,
    };

    for (const commKey in playerInventory) {
        const comm = commKey as Commodity;
        const playerQty = playerInventory[comm]!;
        if (playerQty < 1) { continue; }

        const marketQty = market.inventory[comm];
        if (marketQty !== undefined && marketQty > 0) {
            orderedInventories.common[comm] = {
                player: playerQty,
                market: marketQty
            };
        } else {
            orderedInventories.playerOnly[comm] = playerQty;
        }

    }

    for (const commKey in market.inventory) {
        const comm = commKey as Commodity;
        const marketQty = market.inventory[comm]!;
        if (marketQty < 1) { continue; }

        if (playerInventory[comm] === undefined) {
            orderedInventories.marketOnly[comm] = marketQty;
        }
    }

    return (<>
        <h1>Market</h1>
        <div className="inventory-market-side-by-side">
            <div className="player-inventory">
                <h2>Your Inventory</h2>
                <div className="inventory-display">
                    {Object.entries(orderedInventories.common).map(([comm, { player: qty }]) => {
                        return (
                            <fetcher.Form method="PATCH">
                                <div className='inventory-row'>
                                    <span className='commodity'>{titleCase(comm)}</span>
                                    <span>{`x ${qty}`}</span>
                                    <button type="submit">Sell</button>
                                </div>
                                <input type="hidden" name="commodityKind" value={comm} />
                                <input type="hidden" name="_action" value="sell" />
                            </fetcher.Form>
                        );
                    }
                    )}
                    {Object.entries(orderedInventories.playerOnly).map(([comm, qty]) => {
                        return (
                            <fetcher.Form method="PATCH">
                                <div className='inventory-row'>
                                    <span className='commodity'>{titleCase(comm)}</span>
                                    <span>{`x ${qty}`}</span>
                                    <button type="submit">Sell</button>
                                </div>
                                <input type="hidden" name="commodityKind" value={comm} />
                                <input type="hidden" name="_action" value="sell" />
                            </fetcher.Form>
                        );
                    })}
                    {Object.entries(orderedInventories.marketOnly).map(() => (
                        <div className='inventory-row'>
                            <span className='commodity'> - </span>
                            <span> - </span>
                            <button disabled>Sell</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="market-inventory">
                <h2>Market Inventory</h2>
                <div className="inventory-display">
                    {Object.entries(orderedInventories.common).map(([comm, { market: qty }]) => {
                        return (
                            <fetcher.Form method="PATCH">
                                <div className='inventory-row'>
                                    <span className='commodity'>{titleCase(comm)}</span>
                                    <span>{`x ${qty}`}</span>
                                    <span>
                                        {`${marketPrice(market, comm as Commodity)}`}
                                    </span>
                                    <button type="submit">Buy</button>
                                </div>
                                <input type="hidden" name="commodityKind" value={comm} />
                                <input type="hidden" name="_action" value="buy" />
                            </fetcher.Form>
                        );
                    }
                    )}
                    {Object.entries(orderedInventories.playerOnly).map(() => (
                        <div className='inventory-row'>
                            <span className='commodity'> - </span>
                            <span> - </span>
                            <span> - </span>
                            <button disabled>Buy</button>
                        </div>
                    ))}
                    {Object.entries(orderedInventories.marketOnly).map(([comm, qty]) => (
                        <fetcher.Form method="PATCH">
                            <div className='inventory-row'>
                                <span className='commodity'>{titleCase(comm)}</span>
                                <span>{`x ${qty}`}</span>
                                <span>
                                    {`${marketPrice(market, comm as Commodity)}`}
                                </span>
                                <button type="submit">Buy</button>
                            </div>
                            <input type="hidden" name="commodityKind" value={comm} />
                            <input type="hidden" name="_action" value="buy" />
                        </fetcher.Form>
                    ))}
                </div>
            </div>
        </div>
    </>);
};