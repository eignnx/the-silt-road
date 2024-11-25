import { useLoaderData } from 'react-router-dom';
import { COMMODITIES, Commodity, commodityShortName, UnitPriceSummary } from '../model/Commodities';
import { titleCase } from '../utils';
import { TRADE_LEDGER, TradeLedger as TradeLedgerData } from '../model/TradeLedger';

import "../styles/TradeLedger.css";
import { MarketViewLoaderData } from '../routes/MarketView';
import { marketPrice } from '../model/Markets';

type CommodityRows = {
    [comm in Commodity]?: {
        [townName: string]: {
            unitPrice: number,
            qtyOnHand: number,
        };
    };
};

type Props = {
    // Aligns rows of ledger's commodity column with the commodity rows in bill of sale.
    orderedCommodities: Commodity[],
};

export default function TradeLedger({ orderedCommodities }: Props) {
    const { tradeLedger, market, currentTown } = useLoaderData() as MarketViewLoaderData;

    const commRows: CommodityRows = {};
    for (const comm of COMMODITIES) {
        commRows[comm] = {};

        for (const town in tradeLedger.townVisits) {
            const townVisit = tradeLedger.townVisits[town] ?? {};
            console.log(townVisit);
            const commInv = townVisit.marketSnapshot?.[comm];
            if (commInv) {
                commRows[comm]![town] = commInv;
            }
        }
    }

    function cmpTownsLastVisitDate(
        [_t1, lastVisitDate1]: [string, number],
        [_t2, lastVisitDate2]: [string, number],
    ): number {
        return -(lastVisitDate1 - lastVisitDate2);
    }

    const townOrder: string[] =
        Object.entries(tradeLedger.townVisits)
            .filter(([town, _]) => town !== currentTown)
            .map(([town, info]) => [town, info.lastVisitedDate] as [string, number])
            .sort(cmpTownsLastVisitDate)
            .map(([town, _]: [string, any]) => town);

    const townCount = townOrder.length;
    const townSubCols = 3;
    const cols = townCount * townSubCols + 1;

    return (
        <table className='document trade-ledger'>
            <thead>
                <tr>
                    <th colSpan={cols}>
                        <h3>Trade Ledger</h3>
                    </th>
                </tr>
                <tr className="text-size-smaller">
                    <th rowSpan={2}>Good</th>
                    {townOrder.map(town => (
                        (town !== currentTown) ? <th colSpan={townSubCols}>{town}</th> : null
                    ))}
                </tr>
                <tr className="text-size-smaller">
                    {Array.from({ length: townCount }).map(() => (
                        <>
                            <th>Qty.</th>
                            <th>Price</th>
                            <th>% Diff.</th>
                        </>
                    ))}
                </tr>
            </thead>
            <tbody>
                {orderedCommodities.map(comm => {
                    const commShort = titleCase(commodityShortName(comm));
                    const commLong = titleCase(comm) !== commShort ? titleCase(comm) : undefined;

                    return <tr>
                        <th scope="row" className="commname" title={commLong}>{commShort}</th>
                        {townOrder.map(town => {

                            // Skip listing for current town.
                            if (town === currentTown) return null;

                            const commRow = commRows[comm];
                            if (commRow === undefined) return null;
                            else if (commRow[town] !== undefined) {
                                const { unitPrice: price, qtyOnHand: qty } = commRow[town];


                                const priceHere = marketPrice(market, comm).unitPrice;
                                const pctPriceDiff = 100 * (price - priceHere) / price;

                                return <>
                                    <td className="handwritten">{qty}</td>
                                    <td className="handwritten">{new UnitPriceSummary(comm, price).toString()}</td>
                                    <td className="handwritten">
                                        {pctPriceDiff < 0 ? "-" : "+"}{Math.abs(pctPriceDiff).toFixed(0)}%
                                    </td>
                                </>;
                            } else {
                                return <>
                                    <td>‒</td>
                                    <td>‒</td>
                                    <td>‒</td>
                                </>;
                            }
                        })}
                    </tr>;
                })}
            </tbody>
            <tfoot>

            </tfoot>
        </table>
    );
}