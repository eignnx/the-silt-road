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
            return { long: "ingot", short: "ing" };
        case 'gold':
            return { long: "ounce", short: "oz" };
        case "flour":
        case 'cheese':
        case 'salted meat':
        case "sugar":
        case "salt":
            return { long: "pounds", short: "lbs" };
        case "feed":
        case "grain":
        case "potatoes":
            return { long: "bushel", short: "bsh" };
        case "tobacco":
            return { long: "farm-bales", short: "bale" };
        case "medical supplies":
            return { long: "crates", short: "crate" };
        case "clothing":
        case "firearms":
        case "heavy machinery":
            return { long: "pieces", short: "pc" };
        case "lumber":
            return { long: "board-feet", short: "bdft" };
        case "ammunition":
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
                return 1.10 / 5.0 * 60; // 60lbs per bushel (if wheat)
            case "feed":
                return 0.85 * 1.10 / 5.0 * 32; // 32lbs per bushel (if oats)
            case "flour":
                return 2.75 / 5.0;
            case "spirits": // 12 bottles per case
                return 10.50 * 12;
            case "wine": // 12 bottles per case
                return 14.00 * 12;
            case "sugar":
                return 3.0 / 2.0;
            case "salt":
                return 1.75 / 1.625;
            case "salted meat":
                return 4.595;
            case "potatoes":
                return 0.935 * 60; // 60lbs per bushel
            case 'tobacco':
                return 2.35 * 75; // Price per "farm bale": http://www.aointl.com/files/1414/5796/7368/Glossary_of_Tobacco_Terms.pdf
            case "cheese":
                return 5.731 * 55.0; // per pound * 55 pounds per wheel
            case "lumber":
                return 15.55 / 4.0; // Price of home depot 1x12x4ft board
            case "heavy machinery":
                return 400; // Current price of Vulcan plow: https://bchmt.org/documents/education/Stock-DrawnEquipmentforTrailWork.pdf
            case "ammunition":
                return 450.0; // Price of 1000 rounds of .45 ACP
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
                return 2653.70; // price per oz
            case "coal":
                return 118.70; // price per ton
            case "medical supplies":
                return 95.00; // Price of a medkit crate?
        }
    }
    )());
}

export function dollars2024To1860(dollars_2024: number): number {
    const factor = 100.0 / 3803.18;
    return factor * dollars_2024;
}

export const WEIGHT_UNITS = [
    "oz",
    "lbs",
    "ton", // short ton
] as const;

export type WeightUnit = typeof WEIGHT_UNITS[number];

export class Weight {
    constructor(public quantity: number, public unit: WeightUnit) { }

    static fromOz(quantity: number): Weight {
        return new Weight(quantity, "oz");
    }

    static fromLbs(quantity: number): Weight {
        return new Weight(quantity, "lbs");
    }

    static fromTons(quantity: number): Weight {
        return new Weight(quantity, "ton");
    }

    inLbs(): number {
        switch (this.unit) {
            case 'oz': return this.quantity / 16;
            case 'lbs': return this.quantity;
            case 'ton': return this.quantity * 2000;
        }
    }

    inTons(): number {
        return this.inLbs() / 2000;
    }

    inOz(): number {
        return this.inLbs() * 16;
    }

    times(scalar: number): Weight {
        return new Weight(scalar * this.quantity, this.unit);
    }

    plus(other: Weight): Weight {
        return Weight.fromLbs(this.inLbs() + other.inLbs());
    }

    toString(): string {
        if (this.inOz() < 15.5) {
            return `${this.inOz().toFixed(2)} oz`;
        } else if (this.inTons() >= 1) {
            return `${this.inTons().toFixed(1)} tn`;
        } else {
            return `${this.inLbs().toFixed(1)} lbs`;
        }
    }
}

export function commodityUnitWeight(comm: Commodity): Weight {
    switch (comm) {
        case 'wool':
            return Weight.fromLbs(1);
        case "textiles":
            return Weight.fromOz(2);
        case 'iron':
            return Weight.fromLbs(17.35);
        case 'copper':
            return Weight.fromLbs(19.75);
        case 'nickel':
            return Weight.fromLbs(19.64);
        case 'gold':
            return Weight.fromOz(1);
        case "flour":
        case 'cheese':
        case 'salted meat':
        case "sugar":
        case "salt":
            return Weight.fromLbs(1);
        case "feed": // assuming oats
            return Weight.fromLbs(32);
        case "grain": // assuming wheat
        case "potatoes": // Weirdly also 60? http://webserver.rilin.state.ri.us/Statutes/TITLE47/47-4/47-4-2.HTM
            return Weight.fromLbs(60);
        case "tobacco":
            return Weight.fromLbs(75); // defn of farm-bale: http://www.aointl.com/files/1414/5796/7368/Glossary_of_Tobacco_Terms.pdf
        case "medical supplies":
            return Weight.fromLbs(45); // (Made up)
        case "clothing":
            return Weight.fromLbs(1.5);
        case "firearms":
            return Weight.fromLbs(12); // (Made up)
        case "heavy machinery":
            return Weight.fromLbs(130); // Weight of Vulcan plow: https://bchmt.org/documents/education/Stock-DrawnEquipmentforTrailWork.pdf
        case "lumber":
            return Weight.fromOz(50); // Maple wood density: 0.6g/cm^3, 1 bd-ft = 144 in^4
        case "ammunition":
            return Weight.fromLbs(50);
        case 'wine':
        case "spirits": // 12 bottles per case, 750ml per bottle
            return Weight.fromLbs(20);
        case "coal":
            return Weight.fromTons(1);
    }
}

export function commodityAbbreviatedName(comm: Commodity): string {
    switch (comm) {
        case 'feed': return 'feed';
        case 'grain': return 'grain';
        case 'textiles': return 'txtl.';
        case 'ammunition': return 'amm.';
        case 'firearms': return 'arms';
        case 'heavy machinery': return 'mchnr.';
        case 'medical supplies': return 'meds';
        case 'potatoes': return 'ptoe.';
        case 'sugar': return 'sugr.';
        case 'salt': return 'salt';
        case 'tobacco': return 'tbcco.';
        case 'lumber': return 'lmbr.';
        case 'spirits': return 'sprts.';
        case 'coal': return 'coal';
        case 'flour': return 'flour';
        case 'wine': return 'wine';
        case 'salted meat': return 'sltdmt.';
        case 'cheese': return 'chse.';
        case 'wool': return 'wool';
        case 'iron': return 'iron';
        case 'copper': return 'cppr.';
        case 'nickel': return 'nckl.';
        case 'gold': return 'gold';
        case 'clothing': return 'clthg.';
    }
}

export class UnitPriceSummary {
    static basePrice1860(commodity: Commodity): UnitPriceSummary {
        return new UnitPriceSummary(
            commodity,
            commodityBasePrice1860(commodity),
        );
    }

    constructor(
        public commodity: Commodity,
        public unitPrice: number,
    ) { }

    deviate(deviationPct: number): UnitPriceSummary {
        return new UnitPriceSummary(
            this.commodity,
            this.unitPrice * (1.0 + deviationPct),
        );
    }

    toString(): string {
        const unitPrice = commodityBasePrice1860(this.commodity);
        const u = commodityUnit(this.commodity).short;
        if (unitPrice < 0.01) {
            return `${(this.unitPrice * 100 * 100).toFixed(0)}¢/100${u}`;
        } else if (unitPrice < 1.00) {
            return `${(this.unitPrice * 100).toFixed(0)}¢/${u}`;
        } else if (unitPrice > 1000.0) {
            return `$${(this.unitPrice / 1000.0).toFixed(1)}k/${u}`;
        } else {
            return `$${this.unitPrice.toFixed(2)}/${u}`;
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