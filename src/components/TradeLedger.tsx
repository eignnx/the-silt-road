import { COMMODITIES, Commodity, commodityShortName } from '../model/Commodities';
import { InventoryCmpRow } from '../routes/MarketView';
import "../styles/TradeLedger.css";
import { titleCase } from '../utils';

type TradeLedgerData = {
    [townName: string]: {
        dataAge: number,
        inventory: {
            [comm in Commodity]?: {
                price: number,
                qty: number,
            }
        };
    };
};

type CommodityRows = {
    [comm in Commodity]?: {
        [townName: string]: {
            price: number,
            qty: number,
        };
    };
};

type Props = {
    // Aligns rows of ledger's commodity column with the commodity rows in bill of sale.
    orderedCommodities: Commodity[],
};

export default function TradeLedger({ orderedCommodities }: Props) {
    const tradeLedger: TradeLedgerData = {
        "Rattsville": {
            dataAge: 3,
            inventory: {
                "ammunition": {
                    price: 12.80,
                    qty: 2,
                },
                "clothing": {
                    price: 3.90,
                    qty: 230,
                },
                "tobacco": {
                    price: 4.10,
                    qty: 3213,
                }
            }
        },
        "Buzzard's Gulch": {
            dataAge: 4,
            inventory: {
                "heavy machinery": {
                    price: 13.95,
                    qty: 35,
                },
                "nickel": {
                    price: 18.70,
                    qty: 60,
                }
            }
        },
        "Damnation": {
            dataAge: 10,
            inventory: {
                "ammunition": {
                    price: 14.50,
                    qty: 8,
                },
                "gold": {
                    price: 28.70,
                    qty: 3,
                }
            }
        },
    };

    const commRows: CommodityRows = {};
    for (const comm of COMMODITIES) {
        commRows[comm] = {};

        for (const town in tradeLedger) {
            const commInv = tradeLedger[town].inventory[comm];
            if (commInv) {
                commRows[comm]![town] = commInv;
            }
        }
    }

    function cmpTownsByDataAge(
        [_t1, dataAge1]: [string, number],
        [_t2, dataAge2]: [string, number],
    ): number {
        return dataAge1 - dataAge2;
    }

    const townOrder: string[] =
        Object.entries(tradeLedger)
            .map(([town, info]) => [town, info.dataAge] as [string, number])
            .sort(cmpTownsByDataAge)
            .map(([town, _]: [string, any]) => town);

    const townCount = Object.keys(tradeLedger).length;
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
                        <th colSpan={townSubCols}>{town}</th>
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
                            const commRow = commRows[comm];
                            if (commRow === undefined) return;
                            else if (commRow[town]) {
                                const { price, qty } = commRow[town];
                                return <>
                                    <td className="handwritten">{qty}</td>
                                    <td className="handwritten">${price.toFixed(2)}</td>
                                    <td className="handwritten">+15%</td>
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