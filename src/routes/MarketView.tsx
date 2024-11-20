import { Form, useFetcher, useLoaderData, useSubmit } from 'react-router-dom';
import { COMMODITIES, Commodity, commodityUnit, Inventory } from '../model/Commodities';
import { changeMarketInventory, getMarket, Market, marketPrice, updateMarketInventory } from '../model/Markets';
import { addToPlayerInventory as changePlayerInventory, getPlayerInventory, updatePlayerInventory } from '../model/PlayerInventory';

import '../styles/MarketView.css';
import { titleCase } from '../utils';
import { useState } from 'react';
import { BANK, PLAYER_ACCT } from '../model/BankAcct';

type InventoryCmpRow = { comm: Commodity, playerQty?: number, marketQty?: number; };

type LoaderRetTy = {
    playerInventory: Inventory;
    market: Market;
    playerBankBalance: number;
};

export async function marketViewLoader(): Promise<LoaderRetTy> {
    return {
        playerInventory: getPlayerInventory(),
        market: await getMarket(),
        playerBankBalance: await BANK.getAcctBalance(PLAYER_ACCT),
    };
}

export async function marketViewAction({ request }: { request: Request; }) {
    const { currentTxn, totalBill } = await request.json();

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
    const { playerInventory, market, playerBankBalance } = useLoaderData() as LoaderRetTy;
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

    const tooExpensiveForPlayer = totalBill > playerBankBalance;

    function submitForm() {
        fetcher.submit(
            { currentTxn, totalBill },
            { method: "POST", encType: "application/json" }
        );
        setCurrentTxn({});
    }

    return (<>
        <h1>Market</h1>
        <table>
            <thead>
                <tr>
                    <th colSpan={2} className='header-flavor-text'>
                        <div>
                            Rattsville General Market
                        </div>
                        <div>
                            200 Main St.
                        </div>
                        <div>
                            Rattsville, Hoghead County
                        </div>
                        <div>
                            Colorado, U.S.A.
                        </div>
                    </th>
                    <th colSpan={4} className='title'>Bill of Sale</th>
                    <th colSpan={2} className='header-flavor-text'>
                        <div>
                            FORM 3195, Rev.
                        </div>
                        <div>
                            Hemlock & Co., Print
                        </div>
                        <div>
                            Redistribution Prohibited
                        </div>
                        <div>
                            4000-128 (I6603)
                        </div>
                    </th>
                </tr>
                <tr>

                    <th scope="col" rowSpan={2}>Commodity</th>
                    <th scope="col" rowSpan={2}>Owned</th>
                    <th scope="col" colSpan={4}>Transaction</th>
                    <th scope="col" rowSpan={2}>Avail.</th>
                    <th scope="col" rowSpan={2}>Unit Price</th>
                </tr>
                <tr className='obligations-headers'>
                    <th scope="col" colSpan={2}>Client Obligations</th>
                    <th scope="col" colSpan={2}>Vendor Obligations</th>
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
                            {txnQty === 0 ? (
                                <>
                                    <td>⸺</td>
                                    <td>⸺</td>
                                </>
                            ) : <>
                                <td>
                                    {"☞ "}
                                    {txnQty < 0 ? (
                                        <span className="txnqty numeric">{Math.abs(txnQty)} {commodityUnit(comm).short}</span>
                                    ) : (
                                        <span className="txnprice">${txnPrice.toFixed(2)}</span>
                                    )}
                                </td>
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
                        <p>All sales considered final no sooner than time of purchase.</p>
                        <p>Arbitration services available in case of dispute.</p>
                        <p>Fruadulant representation punishable under U.S. Dept. of Commerce Reg. 471 § 3.6</p>
                    </th>
                    {totalBill >= 0 ? (
                        <>
                            <th colSpan={2}>Total Bill</th>
                            <th colSpan={2}></th>
                        </>
                    ) : (
                        <>
                            <th colSpan={2}></th>
                            <th colSpan={2}>Total Bill</th>
                        </>
                    )}
                    <th colSpan={2}>
                        Date of Sale
                    </th>
                </tr>
                <tr>
                    {totalBill === 0 ? (
                        <>
                            <td colSpan={2}>⸺</td>
                            <td colSpan={2}></td>
                        </>
                    ) : totalBill > 0 ? (
                        <>
                            <td
                                colSpan={2}
                                className={tooExpensiveForPlayer ? "price-too-expensive" : ""}
                                title={tooExpensiveForPlayer ? "You lack the funds to make this purchase!" : undefined}
                            >
                                ${Math.abs(totalBill).toFixed(2)}
                            </td>
                            <td colSpan={2}></td>
                        </>
                    ) : (
                        <>
                            <td colSpan={2}></td>
                            <td colSpan={2}>${Math.abs(totalBill).toFixed(2)}</td>
                        </>
                    )}
                    <td colSpan={2} className='date-of-sale'>
                        17th January 1860
                    </td>
                </tr>
                <tr>
                    <td colSpan={4} className='signature-section'>
                        <div>
                            <span className='signature-label'>Client:</span>
                            <span className='signature'>Homer S. McCoy</span>
                        </div>
                        <div>
                            <span className='signature-label'>Vendor:</span>
                            <span className='signature'>Rattsville General Market</span>
                        </div>
                    </td>
                    <td colSpan={2}>
                        <button
                            type="submit"
                            onClick={submitForm}
                            disabled={tooExpensiveForPlayer}
                            title={tooExpensiveForPlayer ? "You lack the funds to make this purchase!" : undefined}
                        >
                            Confirm Transaction ✗
                        </button>
                    </td>
                </tr>
            </tfoot>
        </table>
    </>);
};