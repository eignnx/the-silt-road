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

// DRAGGABLE DOCUMENTS /////////////////////////////////////////////////////////
const MOUSE_PRIMARY_BTN = 0;

/**
 * 
 * @param el 
 * @returns destructor function which removes event listeners.
 */
export function registerDraggable(el: HTMLElement): () => void {
    let dragging = false;
    let dragStart = [0, 0];
    let absPos = [0, 0];

    function onMouseDown(ev: MouseEvent) {
        if (!dragging && ev.button === MOUSE_PRIMARY_BTN) {
            dragging = true;
            const { pageX, pageY } = ev;
            dragStart = [pageX - absPos[0], pageY - absPos[1]];
            absPos = [pageX - dragStart[0], pageY - dragStart[1]];

            el.style.setProperty("--drag-x", `${absPos[0]}px`);
            el.style.setProperty("--drag-y", `${absPos[1]}px`);
        }
    }

    el.addEventListener("mousedown", onMouseDown);

    function onMouseMove(ev: MouseEvent) {
        if (dragging && ev.button === MOUSE_PRIMARY_BTN) {
            const { pageX, pageY } = ev;
            absPos = [pageX - dragStart[0], pageY - dragStart[1]];

            el.style.setProperty("--drag-x", `${absPos[0]}px`);
            el.style.setProperty("--drag-y", `${absPos[1]}px`);
        }
    }

    el.addEventListener("mousemove", onMouseMove);

    function onMouseUp() {
        dragging = false;
    }

    el.addEventListener("mouseup", onMouseUp);

    return () => {
        el.removeEventListener("mousedown", onMouseDown);
        el.removeEventListener("mousemove", onMouseMove);
        el.removeEventListener("mouseup", onMouseUp);
    };
}
