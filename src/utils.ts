export function titleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function randChoice<T>(arr: T[]): T {
    if (arr.length === 0) throw new Error(`Empty array passed to 'randChoice'`);
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx]!;
}

export function randInt(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low) + low);
}

export function currencyDisplay(amountDollars: number): string {
    if (amountDollars < 1.00) {
        return `${(amountDollars * 100).toFixed(0)}¢`;
    } else {
        return `$${amountDollars.toFixed(2)}`;
    }
}

export function objectKeys<O extends Object>(obj: O): (keyof O)[] {
    return Object.keys(obj) as (keyof O)[];
}

export function objectEntries<O extends Object>(obj: O): [keyof O, O[keyof O]][] {
    return Object.entries(obj) as [keyof O, O[keyof O]][];
}