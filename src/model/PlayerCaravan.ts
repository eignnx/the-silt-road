import { Weight } from './Commodities';
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

export type DraftAnimalStats = {
    maxHaulingWeight: Weight;
    basePrice: number;
};

export function draftAnimalStats(animal: DraftAnimal): DraftAnimalStats {
    switch (animal) {
        case 'horse': return {
            maxHaulingWeight: Weight.fromTons(1),
            basePrice: 150.00,
        };
        case 'ox': return {
            maxHaulingWeight: Weight.fromTons(1.75),
            basePrice: 130.00,
        };
        case 'mule': return {
            maxHaulingWeight: Weight.fromTons(0.65),
            basePrice: 75.00,
        };
    }
}

export const WAGONS = [
    // The classic covered wagon.
    "conestoga",
    // The largest cargo wagon. Requires lots of draft animals.
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

export type WagonStats = {
    cargoCapacity: Weight;
    basePrice: number;
};

export function wagonStats(wagon: Wagon): WagonStats {
    switch (wagon) {
        case 'conestoga': return {
            cargoCapacity: Weight.fromTons(8),
            basePrice: 250.00,
        };
        case 'team wagon': return {
            cargoCapacity: Weight.fromTons(10),
            basePrice: 325.00,
        };
        case 'flatbed': return {
            cargoCapacity: Weight.fromTons(5),
            basePrice: 130.00,
        };
        case 'cart': return {
            cargoCapacity: Weight.fromLbs(350),
            basePrice: 45.00,
        };
        case 'chuck wagon': return {
            cargoCapacity: Weight.fromTons(1.25),
            basePrice: 85.00,
        };
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
        mule: 1,
    },
    wagons: {
        cart: 1,
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
    },

    async cargoCapacity(): Promise<Weight> {
        const { wagons } = await this.get();
        let total = Weight.fromLbs(0);
        for (const wagonKey in wagons) {
            const wagon = wagonKey as Wagon;
            const qty = wagons[wagon] ?? 0;
            const cap = wagonStats(wagon).cargoCapacity;
            total = total.plus(cap.times(qty));
        }
        return total;
    }
};
