export const COMMODITIES = [
    "feed", "grain", "textiles", "ammunition", "firearms", "heavy machinery",
    "medical supplies", "potatoes", "sugar", "salt", "tobacco", "lumber",
    "spirits", "coal", "flour", "wine", "salted meat", "cheese", "wool",
    "iron", "copper", "nickel", "gold", "clothing"
] as const;

export type Commodity = typeof COMMODITIES[number];

export type Inventory = {
    [comm in Commodity]?: number;
};

export function commodityUnit(commodity: Commodity): { short: string, long: string; } {
    switch (commodity) {
        case 'wool':
            return { long: "skeins", short: "sk" };
        case "textiles":
            return { long: "yards", short: "yd" };
        case 'iron':
        case 'copper':
        case 'nickel':
        case 'gold':
            return { long: "ingot", short: "ing" };
        case 'flour':
        case 'cheese':
        case 'salted meat':
        case "feed":
        case "grain":
        case "potatoes":
        case "sugar":
        case "salt":
        case "medical supplies":
        case "tobacco":
            return { long: "pounds", short: "lbs" };
        case "ammunition":
            return { long: "rounds", short: "rnd" };
        case 'clothing':
        case "firearms":
        case "heavy machinery":
            return { long: "pieces", short: "pc" };
        case "lumber":
            return { long: "board-feet", short: "bdft" };
        case 'wine':
        case "spirits":
            return { long: "cases", short: "case" };
        case "coal":
            return { long: "tons", short: "tn" };
    }
}

export function commodityBasePrice1860(commodity: Commodity): number {
    return dollars2024To1860((() => {
        switch (commodity) {
            case "grain":
                return 1.10 / 5.0;
            case "feed":
                return 0.85 * 1.10 / 5.0;
            case "flour":
                return 2.75 / 5.0;
            case "spirits":
                return 10.50;
            case "wine":
                return 14.00;
            case "sugar":
                return 3.0 / 2.0;
            case "salt":
                return 1.75 / 1.625;
            case "salted meat":
                return 4.595;
            case "potatoes":
                return 0.935;
            case "cheese":
                return 5.731 * 55.0; // per pound * 55 pounds per wheel
            case "lumber":
                return 15.55 / 4.0; // Price of home depot 1x12x4ft board
            case "heavy machinery":
                return 1250.0; // Estimate of price of a plow.
            case "ammunition":
                return 450.0 / 1000.0; // Price of 1000 rounds of .45 ACP
            case "firearms":
                return 600.0; // My estimate for price of a midrange handgun.
            case "textiles":
                return 6.0; // Estimate of price of canvas fabric.
            case "wool":
                return 9.0; // Estimate of price of skein of yarn.
            case "clothing":
                return 30.0; // Estimate of price of a shirt.
            case "iron":
                return 0.23; // price per 1000cm^3
            case "copper":
                return 80.0; // price per 1000cm^3
            case "nickel":
                return 203.0; // price per 1000cm^3
            case "gold":
                return 1.704e6; // price per 1000cm^3
            case "coal":
                return 118.70; // price per ton
            case "medical supplies":
                return 24.75; // Price of a medkit?
            case 'tobacco':
                return 2.35; // Price per pound.
        }
    }
    )());
}

export function dollars2024To1860(dollars_2024: number): number {
    const factor = 100.0 / 3803.18;
    return factor * dollars_2024;
}

export class UnitPriceSummary {
    static basePrice1860(commodity: Commodity): UnitPriceSummary {
        return new UnitPriceSummary(
            commodity,
            commodityBasePrice1860(commodity),
            commodityUnit(commodity),
        );
    }

    constructor(
        public commodity: Commodity,
        public unitPrice: number,
        public unit: { short: string, long: string; },
    ) { }

    deviate(deviationPct: number): UnitPriceSummary {
        return new UnitPriceSummary(
            this.commodity,
            this.unitPrice * (1.0 + deviationPct),
            this.unit,
        );
    }

    toString(): string {
        const unitPrice = commodityBasePrice1860(this.commodity);
        const u = this.unit.short;
        if (unitPrice < 0.01) {
            return `${(this.unitPrice * 100 * 100).toFixed(0)}¢ / 100${u}`;
        } else if (unitPrice < 1.00) {
            return `${(this.unitPrice * 100).toFixed(0)}¢ / ${u}`;
        } else if (unitPrice > 1000.0) {
            return `$${(this.unitPrice / 1000.0).toFixed(1)}k / ${u}`;
        } else {
            return `$${this.unitPrice.toFixed(2)} / ${u}`;
        }
    }

}


export function CommoditiesDataList() {
    return (
        <datalist id="commodities">
            {COMMODITIES.map((comm) => (
                <option key={comm} value={comm} />
            ))}
        </datalist>
    );
}