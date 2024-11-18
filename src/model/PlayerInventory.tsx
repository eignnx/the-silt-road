import { Commodity, Inventory } from './Commodities';

const DEFAULT_PLAYER_INVENTORY = JSON.stringify({
    feed: 430,
    grain: 600,
    textiles: 145,
});

export function getPlayerInventory(): Inventory {
    const retreival = localStorage.getItem(`SILT_ROAD:playerInventory`) ?? DEFAULT_PLAYER_INVENTORY;
    return JSON.parse(retreival);
}

export function updatePlayerInventory(updates: Inventory): Inventory {
    const inventory = getPlayerInventory();
    Object.assign(inventory, updates);
    localStorage.setItem(`SILT_ROAD:playerInventory`, JSON.stringify(inventory));
    return inventory;
}

export function addToPlayerInventory(updates: Inventory): Inventory {
    const inventory = getPlayerInventory();
    for (const [comm, qty] of Object.entries(updates)) {
        inventory[comm as Commodity] = (inventory[comm as Commodity] ?? 0) + qty;
    }
    localStorage.setItem(`SILT_ROAD:playerInventory`, JSON.stringify(inventory));
    return inventory;
}