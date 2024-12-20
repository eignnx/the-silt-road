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

/**
 * 
 * @param low inclusive lower bound
 * @param high exclusive upper bound
 * @returns integer between `low` and `high` (exclusive)
 */
export function randInt(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low) + low);
}

export function randFloat(low: number, high: number): number {
    return Math.random() * (high - low) + low;
}

/**
 * Standard Normal variate using Box-Muller transform.
 * source: https://stackoverflow.com/a/36481059
*/
export function randNormal(mean: number = 0, stdev: number = 1, bounds?: [number, number]): number {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    const out = z * stdev + mean;
    if (bounds) {
        const [low, high] = bounds;
        return Math.max(low, Math.min(high, out));
    } else {
        return out;
    }
}

export function randSample<T>(size: number, arr: readonly T[]): T[] {
    if (size > arr.length) {
        return arr.slice();
    }
    const shuffled = arr.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, size);
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

export class DefaultMap<K, V> extends Map<K, V> {
    constructor(private defaultFactory: () => V) {
        super();
    }

    get(key: K): V {
        if (!this.has(key)) {
            const value = this.defaultFactory();
            this.set(key, value);
            return value;
        } else {
            return super.get(key)!;
        }
    }
}

export function arraySwapRemove<T>(array: T[], index: number): T | undefined {
    const lastIndex = array.length - 1;
    if (index < lastIndex) {
        const old = array[index]!;
        array[index] = array[lastIndex];
        return old;
    } else if (index === lastIndex) {
        return array.pop();
    } else {
        throw new Error(`Index out of bounds: ${index} (size is ${array.length})`);
    }
}