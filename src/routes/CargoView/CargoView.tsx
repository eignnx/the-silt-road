import InventoryDisplay from './InventoryDisplay';
import { Commodity, Inventory } from '../../model/Commodities';
import { TRADE_LEDGER } from '../../model/TradeLedger';
import { PLAYER_INVENTORY } from '../../model/PlayerInventory';
import "./Inventory.css";

export type LoaderData = {
    inventory: Inventory,
    inventoryAvgPrices: { [comm in Commodity]?: { price: number, qty: number; } },
};

export async function cargoViewLoader(): Promise<LoaderData> {
    const inventory = await PLAYER_INVENTORY.get();
    const tradeLedger = await TRADE_LEDGER.get();

    return {
        inventory,
        inventoryAvgPrices: tradeLedger.inventoryAvgPrices,
    };
}

export async function cargoViewAction({ request }: { request: Request; }) {

}

export default function CargoView() {
    return (
        <>
            <h1>Cargo</h1>
            <InventoryDisplay />
        </>
    );
}