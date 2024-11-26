import { Dispatch } from 'react';
import { Commodity, commodityAbbreviatedName, commodityUnit, Inventory } from '../model/Commodities';
import { marketPrice } from '../model/Markets';
import { useFetcher, useLoaderData } from 'react-router-dom';
import { InventoryCmpRow, MarketViewLoaderData } from '../routes/MarketView';
import { titleCase } from '../utils';

import "../styles/BillOfSale.css";
import { TRADE_LEDGER } from '../model/TradeLedger';

type Props = {
    orderedInventories: InventoryCmpRow[];
    currentTxn: Inventory,
    setCurrentTxn: Dispatch<React.SetStateAction<Inventory>>;
};

export default function BillOfSale({ orderedInventories, currentTxn, setCurrentTxn }: Props) {

    const {
        market, currentTown, playerBankBalance, playerInfo, tradeLedger
    } = useLoaderData() as MarketViewLoaderData;

    const fetcher = useFetcher();

    function processCurrentTxn(): { [comm in Commodity]?: { price: number, qty: number; } } {
        return Object.fromEntries(
            Object.entries(currentTxn)
                .map(([comm, qty]) => (
                    [comm, {
                        qty,
                        price: marketPrice(market, comm as Commodity).unitPrice
                    }]
                ))
        );
    }

    function addSale(comm: Commodity, qty: number = 1) {
        TRADE_LEDGER.recordTransaction(processCurrentTxn());
        setCurrentTxn(oldTxn => ({
            ...oldTxn,
            [comm]: (oldTxn[comm] ?? 0) - qty
        }));
    }

    function addPurchase(comm: Commodity, qty: number = 1) {
        TRADE_LEDGER.recordTransaction(processCurrentTxn());
        setCurrentTxn(oldTxn => ({
            ...oldTxn,
            [comm]: (oldTxn[comm] ?? 0) + qty
        }));
    }

    let totalBill = 0;
    for (const commKey in currentTxn) {
        const comm = commKey as Commodity;
        totalBill += marketPrice(market, comm).unitPrice * (currentTxn[comm] ?? 0);
    }

    const tooExpensiveForPlayer = totalBill > playerBankBalance;

    function submitForm() {
        fetcher.submit(
            { currentTxn, totalBill, currentTown },
            { method: "POST", encType: "application/json" }
        );
        setCurrentTxn({});
    }

    return (
        <article className='document bill-of-sale'>
            <table >
                <thead>
                    <tr>
                        <th colSpan={2} className='header-flavor-text'>
                            <div>
                                {market.name}
                            </div>
                            <div>
                                200 Main St.
                            </div>
                            <div>
                                {titleCase(currentTown)}, Silt County
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
                                4000-128 (J6603)
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th scope="col" rowSpan={2}>Owned</th>
                        <th scope="col" colSpan={4}>Transaction</th>
                        <th scope="col" rowSpan={2}>Avail.</th>
                        <th scope="col" rowSpan={2}>Good</th>
                        <th scope="col" rowSpan={2}>Price</th>
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
                        const marketUnitPrice = marketPrice(market, comm).unitPrice;
                        const txnPrice = Math.abs(marketUnitPrice * txnQty);

                        const commShort = titleCase(commodityAbbreviatedName(comm));
                        const commLong = titleCase(comm) !== commShort ? titleCase(comm) : undefined;


                        const invLookupPrice = tradeLedger.inventoryAvgPrices[comm]?.price;
                        const priceVsCargoAvg = 100 * (marketUnitPrice - (invLookupPrice ?? 0)) / marketUnitPrice;
                        const priceVsCargoAvgSign = priceVsCargoAvg < 0 ? "-" : "+";

                        const shouldDisplayCmpWithCargo =
                            invLookupPrice !== undefined
                            && (Math.abs(priceVsCargoAvg) > 0.1)
                            && (playerQty ?? 0) > 0;

                        return (playerQty || marketQty) ?
                            <tr>
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
                                        <td className="txn-obligation">⸺</td>
                                        <td className="txn-obligation">⸺</td>
                                    </>
                                ) : <>
                                    <td className="txn-obligation">
                                        {"☞ "}
                                        {txnQty < 0 ? (
                                            <span className="txnqty numeric">{Math.abs(txnQty)} {commodityUnit(comm).short}</span>
                                        ) : (
                                            <span className="txnprice">${txnPrice.toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td className="txn-obligation">
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
                                <th scope="row" className="commname" title={commLong}>{commShort}</th>
                                <td className="unitprice">
                                    {shouldDisplayCmpWithCargo && <div
                                        className="market-price-cmp-to-cargo-cost"
                                    >
                                        <div className="written-in-right-margin">
                                            <div className={[
                                                "handwritten",
                                                priceVsCargoAvg > 0 ? "sale-will-profit" : "sale-wont-profit"
                                            ].join(" ")}>
                                                {priceVsCargoAvgSign}
                                                {Math.abs(priceVsCargoAvg).toFixed(0)}
                                                %
                                            </div>
                                            <div className="handwritten">vs.</div>
                                            <div className="handwritten">cargo</div>
                                        </div>
                                    </div>}
                                    <span>{marketPrice(market, comm).toString()}</span>
                                </td>
                            </tr> : null;
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <th rowSpan={2}>
                            ✯✯✯
                        </th>
                        <th colSpan={4}>Total Bill</th>
                        <th rowSpan={2}>
                            ✯✯✯
                        </th>
                        <th colSpan={2}>
                            Date of Sale
                        </th>
                    </tr>
                    <tr>
                        {totalBill === 0 ? (
                            <>
                                <td colSpan={2}>⸺</td>
                                <td colSpan={2}>⸺</td>
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
                                <td colSpan={2}>⸺</td>
                            </>
                        ) : (
                            <>
                                <td colSpan={2}>⸺</td>
                                <td colSpan={2}>${Math.abs(totalBill).toFixed(2)}</td>
                            </>
                        )}
                        <td colSpan={2} className='date-of-sale'>
                            17th January 1860
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={5} className='signature-section'>
                            <div>
                                <span className='signature-label'>Client:</span>
                                <span className='signature'>{playerInfo.playerName}</span>
                            </div>
                            <div>
                                <span className='signature-label'>Vendor:</span>
                                <span className='printed-signature'>{market.name}</span>
                            </div>
                        </td>
                        <td colSpan={3}>
                            <div>

                                <button
                                    type="submit"
                                    onClick={submitForm}
                                    disabled={tooExpensiveForPlayer || Object.keys(currentTxn).length === 0}
                                    title={tooExpensiveForPlayer ? "You lack the funds to make this purchase!" : undefined}
                                    style={{ width: "100%" }}
                                >
                                    Confirm Transaction ✓
                                </button>
                            </div>
                            <div>
                                <button
                                    type="reset"
                                    disabled={totalBill === 0}
                                    onClick={() => setCurrentTxn({})}
                                    style={{ width: "100%" }}
                                >
                                    Void Transaction ✗

                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th colSpan={8} className='legal-blurb'>
                            <p>All sales considered final no sooner than time of purchase.</p>
                            <p>Arbitration services available in case of dispute.</p>
                            <p>Fruadulant representation punishable under U.S. Dept. of Commerce Reg. 471 § 3.6</p>
                        </th>
                    </tr>
                </tfoot>
            </table>
        </article>
    );
}