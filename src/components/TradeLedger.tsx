import { COMMODITIES, Commodity } from '../model/Commodities';
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

type CommodityRow = {
    comm: Commodity,
    towns: {
        [townName: string]: {
            price: number,
            qty: number,
        };
    };
};

export default function TradeLedger() {
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

    const commRows: CommodityRow[] = [];
    for (const comm of COMMODITIES) {
        const row = {
            comm,
            towns: {} as { [town: string]: { price: number, qty: number; }; }
        };

        for (const town in tradeLedger) {
            const commInv = tradeLedger[town].inventory[comm];
            if (commInv) {
                row.towns[town] = commInv;
            }
        }

        commRows.push(row);
    }
    commRows.sort((a, b) => a.comm.localeCompare(b.comm));

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
                    <th></th>
                    {townOrder.map(town => (
                        <th colSpan={townSubCols}>{town}</th>
                    ))}
                </tr>
                <tr className="text-size-smaller">
                    <th></th>
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
                {commRows.map(row => (
                    <tr>
                        <th scope="row" className="commname">{titleCase(row.comm)}</th>
                        {townOrder.map(town => {
                            if (row.towns[town]) {
                                const { price, qty } = row.towns[town];
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
                    </tr>
                ))}
            </tbody>
            <tfoot>

            </tfoot>
        </table>
    );
}