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

    return (<>
        <h1>Market</h1>
        <div className="inventory-market-side-by-side">
            <div className="market-inventory">
                <h2>Market Inventory</h2>
                <div className="inventory-display">
                    {Object.entries(market.inventory).map(([comm, qty]) => {
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
                </div>
            </div>
            <div className="player-inventory">
                <h2>Your Inventory</h2>
                <div className="inventory-display">
                    {Object.entries(playerInventory).map(([comm, qty]) => {
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
                </div>
            </div>
        </div>
    </>);
}