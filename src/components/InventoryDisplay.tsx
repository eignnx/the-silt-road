import { Form, useLoaderData } from 'react-router-dom';
import { Inventory } from '../model/PlayerInventory';
import { titleCase } from '../utils';
import { Commodity, commodityBasePrice1860, commodityUnit, UnitPriceSummary } from '../model/Commodities';

export default function InventoryDisplay() {
    const { inventory } = useLoaderData() as { inventory: Inventory; };

    return (
        <div className='inventory-display'>
            {Object.entries(inventory).map(([commKey, qty]) => {
                const comm = commKey as Commodity;
                const unit = commodityUnit(comm).short;
                const unitPrice = UnitPriceSummary.basePrice1860(comm);
                return (
                    <div className='inventory-row'>
                        <span className='commodity'>{titleCase(comm)}</span>
                        <span>{`x ${qty}`}</span>
                        <span>{`${unitPrice}`}</span>
                        <Form method="delete" className='inventory-delete-btn'>
                            <input type="hidden" name="comm" value={comm} />
                            <button type="submit">Delete</button>
                        </Form>
                    </div>);
            })}
        </div>
    );
}