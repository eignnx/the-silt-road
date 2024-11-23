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