import { useLoaderData } from 'react-router-dom';
import { commodityUnit, commodityUnitWeight, Weight } from '../model/Commodities';
import { currencyDisplay, titleCase } from '../utils';
import { Commodity } from '../model/Commodities';
import { LoaderData } from '../routes/CargoView';

import "../styles/Inventory.css";

export default function InventoryDisplay() {
    const { inventory, inventoryAvgPrices } = useLoaderData() as LoaderData;

    const MIN_ROWS = 8;
    const blankRows = Math.max(0, MIN_ROWS - Object.keys(inventory).length);

    let totalInvestment = 0;
    let totalWeight = Weight.fromLbs(0);
    for (const [commKey, qty] of Object.entries(inventory)) {
        const comm = commKey as Commodity;
        const { price } = inventoryAvgPrices[comm] ?? { price: -1234, qty: -1234 };
        totalInvestment += price * qty;
        totalWeight = totalWeight.plus(commodityUnitWeight(comm).times(qty));
    }

    return (
        <article className="document inventory-display">
            <hgroup>
                <h3>Cargo Manifest</h3>
                <div>Memorandum</div>
            </hgroup>
            <div className="heading-flavor-text">
                <span>Form 57-CM</span>
                <span>Date of survey: <span className="handwritten">5/21</span></span>
            </div>
            <table >
                <thead>
                    <tr>
                        <th>Good</th>
                        <th>Quantity</th>
                        <th>
                            <div>

                                Investment<sup ><button {...{ popovertarget: "investment-popover" }}>*</button></sup>
                            </div>
                            <div {...{ popover: "auto" }}
                                id="investment-popover"
                                className="heading-explainer">
                                *total expenditure on cargo category
                            </div>

                        </th>
                        <th>Weight</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(inventory).map(([commKey, qty]) => {
                        const comm = commKey as Commodity;
                        const { price } = inventoryAvgPrices[comm] ?? { price: -1234, qty: -1234 };
                        const investment = price * qty;
                        return <tr>
                            <th scope="row">{titleCase(comm)}</th>
                            <td className="handwritten">{qty} {commodityUnit(comm).short}</td>
                            <td className="handwritten">{currencyDisplay(investment)}</td>
                            <td className="handwritten">{commodityUnitWeight(comm).times(qty).toString()}</td>
                        </tr>;
                    })}
                    {Array.from({ length: blankRows }).map(() => (
                        <tr>
                            <th scope="row">-</th>
                            <td className="handwritten">-</td>
                            <td className="handwritten">-</td>
                            <td className="handwritten">-</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <th scope="row" colSpan={1}>Totals:</th>
                        <td className="handwritten">{currencyDisplay(totalInvestment)}</td>
                        <td className="handwritten">{totalWeight.toString()}</td>
                    </tr>
                    <tr>
                        <td colSpan={4} className="cell-with-counter">
                            <div>I certify this report to be accurate and complete:</div>
                            <div>Signature:<span className="handwritten">Will O'Leary</span></div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </article>
    );
}