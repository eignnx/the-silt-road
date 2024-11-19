import { Form, useFetcher, useLoaderData, useSubmit } from 'react-router-dom';
import { COMMODITIES, Commodity, commodityUnit, Inventory } from '../model/Commodities';
import { changeMarketInventory, getMarket, Market, marketPrice, updateMarketInventory } from '../model/Markets';
import { addToPlayerInventory as changePlayerInventory, getPlayerInventory, updatePlayerInventory } from '../model/PlayerInventory';

import '../styles/MarketView.css';
import { titleCase } from '../utils';
import { useState } from 'react';

type InventoryCmpRow = { comm: Commodity, playerQty?: number, marketQty?: number; };

type LoaderRetTy = { playerInventory: Inventory, market: Market; };

export async function marketViewLoader(): Promise<LoaderRetTy> {
    return {
        playerInventory: getPlayerInventory(),
        market: await getMarket(),
    };
}

export async function marketViewAction({ request }: { request: Request; }) {
    const formData = await request.formData();
    const playerInvUpdates: Inventory = {};
    const marketInvUpdates: Inventory = {};

    for (const [commKey, qtyStr] of formData.entries()) {
        const comm = commKey as Commodity;
        const qty = +qtyStr;
        playerInvUpdates[comm] = +qty;
        marketInvUpdates[comm] = -qty;
    }

    changePlayerInventory(playerInvUpdates);
    await changeMarketInventory(marketInvUpdates);

    return null;
}

function computeOrderedInventories(playerInventory: Inventory, market: Market, currentTxn: Inventory): InventoryCmpRow[] {
    const orderedInventories: InventoryCmpRow[] = [];

    for (const comm of COMMODITIES) {
        const playerQty = (playerInventory[comm] ?? 0) + (currentTxn[comm] ?? 0);
        const marketQty = (market.inventory[comm] ?? 0) - (currentTxn[comm] ?? 0);
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

export default function MarketView() {
    const { playerInventory, market } = useLoaderData() as LoaderRetTy;
    const fetcher = useFetcher();

    const [currentTxn, setCurrentTxn] = useState<Inventory>({});
    const orderedInventories = computeOrderedInventories(playerInventory, market, currentTxn);

    function addSale(comm: Commodity, qty: number = 1) {
        setCurrentTxn(oldTxn => ({
            ...oldTxn,
            [comm]: (oldTxn[comm] ?? 0) - qty
        }));
    }

    function addPurchase(comm: Commodity, qty: number = 1) {
        setCurrentTxn(oldTxn => ({
            ...oldTxn,
            [comm]: (oldTxn[comm] ?? 0) + qty
        }));
    }

    let totalBill = 0;
    let saleQty = 0;
    for (const commKey in currentTxn) {
        const comm = commKey as Commodity;
        totalBill += marketPrice(market, comm).unitPrice * (currentTxn[comm] ?? 0);
        saleQty += currentTxn[comm] ?? 0;
    }

    return (<>
        <h1>Market</h1>
        <table>
            <thead>
                <tr>
                    <th scope="col">Commodity</th>
                    <th scope="col">Owned</th>
                    <th scope="col" colSpan={4}>Transaction</th>
                    <th scope="col">Avail.</th>
                    <th scope="col">Unit Price</th>
                </tr>
            </thead>
            <tbody>
                {orderedInventories.map(({ comm, playerQty, marketQty }) => {

                    // The number of units being transferred (negative means sale to market).
                    const txnQty = currentTxn[comm] ?? 0;
                    const txnPrice = Math.abs(marketPrice(market, comm).unitPrice * txnQty);

                    return (playerQty || marketQty) ?
                        <tr>
                            <th scope="row">{titleCase(comm)}</th>
                            <td className='numeric'>{playerQty ?? "⸺"}</td>
                            <td>
                                <button
                                    disabled={!playerQty}
                                    onClick={() => addSale(comm)}
                                >
                                    Sell
                                </button>
                            </td>
                            {txnQty === 0 ? <td colSpan={2}>⸺</td> : <>
                                <td>
                                    {"☞ "}
                                    {txnQty < 0 ? (
                                        <span className="txnqty numeric">{Math.abs(txnQty)} {commodityUnit(comm).short}</span>
                                    ) : (
                                        <span className="txnprice">${txnPrice.toFixed(2)}</span>
                                    )}
                                </td>
                                {/* <td className='manicule'>
                                    {txnQty !== 0 ? "⬌" : ""}
                                    {txnQty !== 0 ? "☜☞" : ""}
                                    {txnQty < 0 ? "☞" : txnQty > 0 ? "☜" : "⸺"}
                                </td> */}
                                <td>
                                    {txnQty > 0 ? (
                                        <span className="txnqty numeric">{Math.abs(txnQty)} {commodityUnit(comm).short}</span>
                                    ) : (
                                        <span className="txnprice">${txnPrice.toFixed(2)}</span>
                                    )}
                                    {" ☜"}
                                </td>
                            </>}
                            <td>
                                <button
                                    disabled={!marketQty}
                                    onClick={() => addPurchase(comm)}
                                >
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
                    {totalBill > 0 ? (
                        <>
                            <th colSpan={2}>Total Bill</th>
                            <th colSpan={2}>Sale Qty.</th>
                        </>
                    ) : (
                        <>
                            <th colSpan={2}>Sale Qty.</th>
                            <th colSpan={2}>Total Bill</th>
                        </>
                    )}
                    <th colSpan={2}></th>
                </tr>
                <tr>
                    {totalBill > 0 ? (
                        <>
                            <td colSpan={2}>${Math.abs(totalBill).toFixed(2)}</td>
                            <td colSpan={2}>{Math.abs(saleQty)}</td>
                        </>
                    ) : (
                        <>
                            <td colSpan={2}>{Math.abs(saleQty)}</td>
                            <td colSpan={2}>${Math.abs(totalBill).toFixed(2)}</td>
                        </>
                    )}
                    {/* <td>
                        {saleQty < 0 ? "☞" : saleQty > 0 ? "☜" : "⸺"}
                    </td> */}
                    <td colSpan={2}>
                    </td>
                </tr>
                <tr>
                    <td colSpan={4}>
                        <button
                            type="submit"
                            onClick={() => {
                                console.log(currentTxn);
                                const fd = new FormData();
                                Object.entries(currentTxn).forEach(([comm, qty]) => {
                                    fd.append(comm, qty.toString());
                                });
                                fetcher.submit(fd, { method: "POST" });
                                setCurrentTxn({});
                            }}
                        >
                            Confirm Transaction ✗
                        </button>
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