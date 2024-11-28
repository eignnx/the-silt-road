import { useLoaderData } from 'react-router-dom';
import { commodityUnit } from '../model/Commodities';
import { titleCase } from '../utils';
import { Commodity } from '../model/Commodities';
import { LoaderData } from '../routes/CargoView';

export default function InventoryDisplay() {
    const { inventory, inventoryAvgPrices } = useLoaderData() as LoaderData;

    const MIN_ROWS = 8;
    const blankRows = Math.max(0, MIN_ROWS - Object.keys(inventory).length);

    return (
        <article className="document inventory-display">

            <hgroup>
                <h3>Cargo Manifest</h3>
                <div>Memorandum</div>
            </hgroup>
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
                                total expenditure on cargo category
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
                            <td>{qty} {commodityUnit(comm).short}</td>
                            <td>${investment.toFixed(2)}</td>
                            <td>35lbs</td>
                        </tr>;
                    })}
                    {Array.from({ length: blankRows }).map(() => (
                        <tr>
                            <th scope="row">-</th>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td colSpan={3} className="cell-with-counter">
                            <div>I certify this report to be accurate and complete:</div>
                            <div>Signature:<span className="handwritten">Will O'Leary</span></div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </article>
    );
}