import { Commodity, Inventory } from './Commodities';
import { MakeStorage } from './storage-template';

const DEFAULT_PLAYER_INVENTORY: Inventory = {
    feed: 3,
    grain: 2,
    textiles: 20,
};

export const PLAYER_INVENTORY = {
    ...MakeStorage({
        resourceKey: "playerInventory",
        seedValue: DEFAULT_PLAYER_INVENTORY,
    }),

    async update(updates: Inventory): Promise<Inventory> {
        const inventory = await this.get();
        Object.assign(inventory, updates);
        this.replace(inventory);
        return inventory;
    },

    async addToPlayerInventory(updates: Inventory): Promise<Inventory> {
        const inventory = await this.get();
        for (const [comm, qty] of Object.entries(updates)) {
            const newQty = (inventory[comm as Commodity] ?? 0) + qty;
            if (newQty > 0) {
                inventory[comm as Commodity] = newQty;
            } else if (newQty === 0) {
                inventory[comm as Commodity] = undefined;
            } else {
                throw new Error(`Cannot take Player Inventory quantity for ${comm} below zero to ${newQty}`);
            }
        }
        this.replace(inventory);
        return inventory;
    },
};
