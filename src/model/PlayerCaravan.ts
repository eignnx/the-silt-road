import { MakeStorage } from './storage-template';

export const DRAFT_ANIMALS = [
    "horse",
    "ox",
    "mule",
] as const;

export type DraftAnimal = typeof DRAFT_ANIMALS[number];

export function pluralizeDraftAnimal(draftAnimal: DraftAnimal, qty: number): string {
    if (qty === 1) {
        return draftAnimal;
    } else {
        switch (draftAnimal) {
            case "horse":
                return "horses";
            case "ox":
                return "oxen";
            case "mule":
                return "mules";
        }
    }
}

export const WAGONS = [
    // The classic covered wagon.
    "conestoga",
    // The largest cargo wagon. Requires lots of  draught animals.
    "team wagon",
    // Medium-sized cargo wagon.
    "flatbed",
    // A 2-wheeled cart.
    "cart",
    // Carries food, cooking equipment.
    "chuck wagon",
] as const;

export type Wagon = typeof WAGONS[number];

export function displayWagon(wagon: Wagon): string {
    switch (wagon) {
        case "conestoga":
            return "Conestoga wagon";
        case "team wagon":
            return "team wagon";
        case "flatbed":
            return "flatbed wagon";
        case "cart":
            return "cart";
        case "chuck wagon":
            return "chuck wagon";
    }
}

export type Caravan = {
    draftAnimals: {
        [animal in DraftAnimal]?: number;
    };
    wagons: {
        [wagon in Wagon]?: number;
    };
};

const DEFAULT_PLAYER_CARAVAN: Caravan = {
    draftAnimals: {
        horse: 2,
        ox: 6,
    },
    wagons: {
        conestoga: 1,
        flatbed: 1,
    },
};

export const CARAVAN = {
    ...MakeStorage({
        resourceKey: "playerCaravan",
        seedValue: DEFAULT_PLAYER_CARAVAN,
    }),

    async change(updates: Partial<Caravan>): Promise<Caravan> {
        const caravan = await this.get();

        for (const animal in updates.draftAnimals ?? {}) {
            const qty = updates.draftAnimals![animal as DraftAnimal]!;
            caravan.draftAnimals[animal as DraftAnimal] =
                (caravan.draftAnimals[animal as DraftAnimal] ?? 0) + qty;
        }
        for (const wagon in updates.wagons ?? {}) {
            const qty = updates.wagons![wagon as Wagon]!;
            caravan.wagons[wagon as Wagon] =
                (caravan.wagons[wagon as Wagon] ?? 0) + qty;
        }

        await this.replace(caravan);
        return caravan;
    }
};
