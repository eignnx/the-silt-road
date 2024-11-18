import { redirect, useFetcher, } from 'react-router-dom';
import "../styles/index.css";
import "../styles/Inventory.css";
import { addToPlayerInventory, getPlayerInventory, updatePlayerInventory } from '../model/PlayerInventory';
import InventoryDisplay from '../components/InventoryDisplay';
import { useEffect, useRef } from 'react';
import { COMMODITIES } from '../model/Commodities';

export function loader() {
    const inventory = getPlayerInventory();
    return { inventory };
}

export async function action({ request, params }: { request: any, params: any; }) {
    const formData = await request.formData();
    const { comm, qty } = Object.fromEntries(formData);
    if (COMMODITIES.includes(comm)) {
        addToPlayerInventory({ [comm]: +qty });
        return redirect("");
    } else {
        throw new Error(`'${comm}' is not a valid commodity.`);
    }
}

export default function InventoryEditor() {
    const fetcher = useFetcher();
    const notSubmitting = fetcher.state !== "submitting";
    const formRef = useRef<HTMLFormElement>(null);
    const focusRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (notSubmitting) {
            formRef.current?.reset();
            focusRef.current?.focus();
        }
    }, [notSubmitting]);

    return (
        <>
            <h1>Add to Inventory</h1>
            <fetcher.Form
                method='post'
                ref={formRef}
            >
                <label>
                    <span>Commodity</span>
                    <input
                        type="text"
                        name="comm"
                        list="commodities"
                        required
                        placeholder='Commodity to add...'
                        ref={focusRef}
                    />
                </label>
                <label>
                    <span>Quantity</span>
                    <input type="number" name="qty" required placeholder='Quantity to add...' />
                </label>
                <button
                    type="submit"
                    disabled={!notSubmitting}
                >Add to Inventory</button>
            </fetcher.Form>

            <h1>Your Cargo</h1>
            <InventoryDisplay />
        </>
    );
}