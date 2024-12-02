import { Dispatch, useContext, useEffect, useRef, useState } from 'react';
import { useFetcher, useLoaderData } from 'react-router-dom';
import { Commodity, commodityAbbreviatedName, commodityUnit, commodityUnitWeight, Inventory, Weight } from '../../model/Commodities';
import { marketPrice } from '../../model/Markets';
import { TRADE_LEDGER } from '../../model/TradeLedger';
import { InventoryCmpRow, MarketViewLoaderData } from './MarketView';
import { titleCase } from '../../utils';
import "./BillOfSale.css";
import { SetTxnWeight } from '../Dashboard/Dashboard';
import { CARAVAN } from '../../model/PlayerCaravan';

type Props = {
    orderedInventories: InventoryCmpRow[];
    currentTxn: Inventory,
    setCurrentTxn: Dispatch<React.SetStateAction<Inventory>>;
};

export default function BillOfSale({ orderedInventories, currentTxn, setCurrentTxn }: Props) {

    const {
        playerInventory, market, currentTown, playerBankBalance, playerInfo, tradeLedger
    } = useLoaderData() as MarketViewLoaderData;

    const fetcher = useFetcher();

    const { overCapacity, setTxnWeight } = useContext(SetTxnWeight);

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
        setCurrentTxn(oldTxn => {
            const playerQty = playerInventory[comm] ?? 0;
            const txnQty = oldTxn[comm] ?? 0;
            qty = Math.min(qty, playerQty + txnQty);

            setTxnWeight(oldWeight => oldWeight.plus(commodityUnitWeight(comm).times(-qty)));
            console.log("sale", comm, qty);
            return {
                ...oldTxn,
                [comm]: (oldTxn[comm] ?? 0) - qty
            };
        });
    }

    function addPurchase(comm: Commodity, qty: number = 1) {
        setCurrentTxn(oldTxn => {
            const marketQty = market.inventory[comm] ?? 0;
            const txnQty = oldTxn[comm] ?? 0;
            qty = Math.min(qty, marketQty - txnQty);

            setTxnWeight(oldWeight => oldWeight.plus(commodityUnitWeight(comm).times(+qty)));
            console.log("purchase", comm, qty);
            return {
                ...oldTxn,
                [comm]: (oldTxn[comm] ?? 0) + qty
            };
        });
    }

    function voidTransaction() {
        setCurrentTxn({});
        setTxnWeight(Weight.fromLbs(0));
    }

    let totalBill = 0;
    for (const commKey in currentTxn) {
        const comm = commKey as Commodity;
        totalBill += marketPrice(market, comm).unitPrice * (currentTxn[comm] ?? 0);
    }

    const tooExpensiveForPlayer = totalBill > playerBankBalance;
    const emptyTxn = Object.keys(currentTxn).length === 0;
    const confirmTransactionBtnDisabled =
        tooExpensiveForPlayer || emptyTxn || overCapacity;
    const confirmBtnDisabledExplanation = tooExpensiveForPlayer ? "You lack the funds to make this purchase." : overCapacity ? "You lack the cargo capacity to make this purchase." : undefined;

    function submitForm() {
        fetcher.submit(
            { currentTxn, totalBill, currentTown },
            { method: "POST", encType: "application/json" }
        );
        TRADE_LEDGER.recordTransaction(processCurrentTxn());
        setCurrentTxn({});
    }


    const [ctrlDown, setCtrlDown] = useState(false);

    function handle(e: KeyboardEvent) {
        if (e.key === "Control") {
            setCtrlDown(e.ctrlKey);
        }
    }

    useEffect(() => {
        console.log("adding keyboard event listener");

        document.addEventListener("keydown", handle);
        document.addEventListener("keyup", handle);

        return () => {
            console.log("removing keyboard event listener");
            document.removeEventListener("keydown", handle);
            document.removeEventListener("keyup", handle);
        };
    }, []);

    return (
        <article
            className='document bill-of-sale'
        >
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
                    {orderedInventories.map(renderTbodyRow(ctrlDown))}
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
                                    title={confirmBtnDisabledExplanation}
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
                                    disabled={confirmTransactionBtnDisabled}
                                    title={confirmBtnDisabledExplanation}
                                    style={{ width: "100%" }}
                                >
                                    Confirm Transaction ✓
                                </button>
                            </div>
                            <div>
                                <button
                                    type="reset"
                                    disabled={totalBill === 0}
                                    onClick={voidTransaction}
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

    function renderTbodyRow(ctrlDown: boolean) {
        return ({ comm, playerQty, marketQty }: InventoryCmpRow) => {

            // The number of units being transferred (negative means sale to market).
            const txnQty = currentTxn[comm] ?? 0;
            const marketUnitPrice = marketPrice(market, comm).unitPrice;
            const txnPrice = Math.abs(marketUnitPrice * txnQty);

            const commShort = titleCase(commodityAbbreviatedName(comm));
            const commLong = titleCase(comm);


            const invLookupPrice = tradeLedger.inventoryAvgPrices[comm]?.price;
            const priceVsCargoAvg = 100 * (marketUnitPrice - (invLookupPrice ?? 0)) / marketUnitPrice;
            const priceVsCargoAvgSign = priceVsCargoAvg < 0 ? "-" : "+";

            const shouldDisplayCmpWithCargo = invLookupPrice !== undefined
                && (Math.abs(priceVsCargoAvg) > 0.1)
                && (playerQty ?? 0) > 0;

            const qty = !ctrlDown ? 1 : 10;

            const qtyBeingSold = Math.max(0, -txnQty);
            const qtyBeingBought = Math.max(0, txnQty);
            const sellBtnDisabled = !((playerQty ?? 0) > 0 || qtyBeingBought > 0);
            const buyBtnDisabled = !((marketQty ?? 0) > 0 || qtyBeingSold > 0);

            return (playerQty || marketQty || txnQty !== 0) ?
                <tr>
                    <td className='numeric'>{playerQty ?? "⸺"}</td>
                    <td>
                        <button
                            disabled={sellBtnDisabled}
                            onClick={() => addSale(comm, qty)}
                        >
                            Sell{ctrlDown && <span className="btn-10x"> x10</span>} ☞
                        </button>
                    </td>
                    {txnQty === 0 ? (
                        <>
                            <td className="txn-obligation">⸺</td>
                            <td className="txn-obligation">⸺</td>
                        </>
                    ) : <>
                        <td className="txn-obligation">
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
                        </td>
                    </>}
                    <td>
                        <button
                            disabled={buyBtnDisabled}
                            onClick={() => addPurchase(comm, qty)}
                        >
                            ☜ Buy{ctrlDown && <span className="btn-10x"> x10</span>}
                        </button>
                    </td>
                    <td className='numeric'>{marketQty ?? "⸺"}</td>
                    <th scope="row" className="commname">{commLong}</th>
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
        };
    }
}