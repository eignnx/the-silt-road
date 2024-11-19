import { useFetcher, useLoaderData } from 'react-router-dom';
import { COMMODITIES, Commodity, Inventory } from '../model/Commodities';
import { changeMarketInventory, getMarket, Market, marketPrice } from '../model/Markets';
import { addToPlayerInventory, getPlayerInventory } from '../model/PlayerInventory';

import '../styles/MarketView.css';
import { titleCase } from '../utils';

type InventoryCmpRow = { comm: Commodity, playerQty?: number, marketQty?: number; };

type LoaderRetTy = { orderedInventories: InventoryCmpRow[], market: Market; };

export async function marketViewLoader(): Promise<LoaderRetTy> {
    const playerInventory = getPlayerInventory();
    const market = await getMarket();

    const orderedInventories: InventoryCmpRow[] = [];

    for (const comm of COMMODITIES) {
        const playerQty = playerInventory[comm] ?? 0;
        const marketQty = market.inventory[comm] ?? 0;
        orderedInventories.push({
            comm,
            playerQty: playerQty > 0 ? playerQty : undefined,
            marketQty: marketQty > 0 ? marketQty : undefined,
        });
    }

    // Sort inventory by commodity name:
    orderedInventories.sort((a, b) => a.comm.localeCompare(b.comm));

    return { orderedInventories, market };
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
    const { orderedInventories, market } = useLoaderData() as LoaderRetTy;
    const fetcher = useFetcher();

    return (<>
        <h1>Market</h1>
        {/* <div className="inventory-market-side-by-side">
            {orderedInventories.map(({ comm, playerQty, marketQty }) => (
                (playerQty || marketQty) &&
                <>
                    <span className="commname">{titleCase(comm)}</span>
                    <span className="playerqty">{playerQty ?? "-"}</span>
                    <button className="sellbtn">Sell</button>
                    <span className="txnqty">{"⇦10⇨"}</span>
                    <button className="buybtn">Buy</button>
                    <span className="marketqty">{marketQty ?? "-"}</span>
                    <span className="unitprice">{marketPrice(market, comm).toString()}</span>
                </>
            ))}
        </div> */}
        <table>
            <thead>
                <tr>
                    <th scope="col">Commodity</th>
                    <th scope="col">Owned Qty.</th>
                    <th scope="col" colSpan={5}>Transaction</th>
                    <th scope="col">Market Qty.</th>
                    <th scope="col">Unit Price</th>
                </tr>
            </thead>
            <tbody>
                {orderedInventories.map(({ comm, playerQty, marketQty }) => {

                    // Dummy data for now:
                    const txn = ((comm.length % 3) - 1) * comm.length;

                    return (playerQty || marketQty) ?
                        <tr>
                            <th scope="row">{titleCase(comm)}</th>
                            <td className='numeric'>{playerQty ?? "⸺"}</td>
                            <td>
                                <button disabled={!playerQty}>
                                    Sell
                                </button>
                            </td>
                            {txn === 0 ? <td colSpan={3}>⸺</td> : <>
                                <td>
                                    <span className="txnprice">${Math.abs(txn * 431 / 100).toFixed(2)}</span>
                                </td>
                                <td>
                                    {txn > 0 ? "☞" : txn < 0 ? "☜" : "⸺"}
                                </td>
                                <td>
                                    <span className="txnqty numeric">x{Math.abs(txn)}</span>
                                </td>
                            </>}
                            <td>
                                <button disabled={!marketQty}>
                                    Buy
                                </button>
                            </td>
                            <td className='numeric'>{marketQty ?? "⸺"}</td>
                            <td>{marketPrice(market, comm).toString()}</td>
                        </tr> : null;
                })}
            </tbody>
            <tfoot>
                <tr>
                    <th colSpan={2} rowSpan={3} className='legal-blurb'>
                        <p>All sales considered final at time of purchase. Arbitration services available in case of dispute.</p>
                        <p>Violations punishable under U.S. Dept. of Commerce Reg. 471 § 3.6</p>
                    </th>
                    <th colSpan={2}>Total Bill</th>
                    <th></th>
                    <th colSpan={2}>Sale Qty.</th>
                    <th colSpan={2}></th>
                </tr>
                <tr>
                    <td colSpan={2}>$550.75</td>
                    <td>
                        {200 > 0 ? "☞" : 200 < 0 ? "☜" : "⸺"}
                    </td>
                    <td colSpan={2}>123</td>
                    <td colSpan={2}>
                    </td>
                </tr>
                <tr>
                    <td colSpan={5}>
                        <button>Confirm Transaction ✗</button>
                    </td>
                    <td colSpan={2} className='signature-section'>
                        <div>
                            <span className='signature-label'>Purchaser:</span>
                            <span className='signature'>Homer S. McCoy</span>
                        </div>
                        <div>
                            <span className='signature-label'>Vendor:</span>
                            <span className='signature'>Rattsville General Market</span>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
    </>);
};