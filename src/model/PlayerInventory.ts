import { Commodity, Inventory } from './Commodities';
import { MakeStorage } from './storage-template';

const DEFAULT_PLAYER_INVENTORY: Inventory = {
    feed: 430,
    grain: 600,
    textiles: 145,
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
            inventory[comm as Commodity] = (inventory[comm as Commodity] ?? 0) + qty;
        }
        this.replace(inventory);
        return inventory;
    },
};
