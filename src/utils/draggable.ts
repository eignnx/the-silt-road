import React, { useEffect, useRef } from "react";


export function useDraggable<E extends HTMLElement>(): React.RefObject<E> {
    const drag = useRef<E>(null);

    useEffect(() => {
        if (drag.current)
            return registerDraggable(drag.current);
        else
            return () => { };
    }, [drag]);

    return drag;
}

const MOUSE_PRIMARY_BTN = 0;

/**
 * 
 * @param el 
 * @returns destructor function which removes event listeners.
 */
function registerDraggable(el: HTMLElement): () => void {
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
            el.classList.add("dragging");
            const { pageX, pageY } = ev;
            absPos = [pageX - dragStart[0], pageY - dragStart[1]];

            el.style.setProperty("--drag-x", `${absPos[0]}px`);
            el.style.setProperty("--drag-y", `${absPos[1]}px`);
        } else {
            el.classList.remove("dragging");
        }
    }

    el.addEventListener("mousemove", onMouseMove);

    function onMouseUp() {
        dragging = false;
        el.classList.remove("dragging");
    }

    el.addEventListener("mouseup", onMouseUp);

    return () => {
        el.removeEventListener("mousedown", onMouseDown);
        el.removeEventListener("mousemove", onMouseMove);
        el.removeEventListener("mouseup", onMouseUp);
    };
}