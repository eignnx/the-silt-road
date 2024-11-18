import { Commodity } from './Commodities';

export type Inventory = {
    [comm in Commodity]?: number;
};

const DEFAULT_PLAYER_INVENTORY = JSON.stringify({
    feed: 430,
    grain: 600,
    textiles: 145,
});

export function getPlayerInventory(): Inventory {
    const retreival = localStorage.getItem(`SILT_ROAD:playerInventory`) ?? DEFAULT_PLAYER_INVENTORY;
    return JSON.parse(retreival);
}

export function updatePlayerInventory(updates: any): Inventory {
    const inventory = getPlayerInventory();
    Object.assign(inventory, updates);
    localStorage.setItem(`SILT_ROAD:playerInventory`, JSON.stringify(inventory));
    return inventory;
}