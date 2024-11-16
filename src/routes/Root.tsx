import { Form, redirect, } from 'react-router-dom';
import "../index.css";
import "../Inventory.css";
import { getPlayerInventory, updatePlayerInventory } from '../model/PlayerInventory';
import InventoryDisplay from '../components/InventoryDisplay';
import { useRef } from 'react';

export function loader() {
    const inventory = getPlayerInventory();
    return { inventory };
}

export async function action({ request, params }: { request: any, params: any; }) {
    const formData = await request.formData();
    const { comm, qty } = Object.fromEntries(formData);
    updatePlayerInventory({ [comm]: qty });
    return redirect("/");
}

export default function Root() {
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <>
            <h1>Add to Inventory</h1>
            <Form
                method='post'
                ref={formRef}
            >
                <label>
                    <span>Commodity</span>
                    <input type="text" name="comm" list="commodities" required placeholder='Commodity to add...' />
                </label>
                <label>
                    <span>Quantity</span>
                    <input type="number" name="qty" required placeholder='Quantity to add...' />
                </label>
                <button type="submit">Add to Inventory</button>
            </Form>

            <h1>Your Cargo</h1>
            <InventoryDisplay />
        </>
    );
}