import React, { useEffect, useRef } from "react";

type Props = {
    children: React.ReactNode;
};

const Draggable: React.FC<Props> = ({ children }) => {
    const dragRef = useDraggable<HTMLDivElement>();

    return <div className="draggable" ref={dragRef}>
        {children}
    </div>;
};

function useDraggable<E extends HTMLElement>(): React.RefObject<E> {
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
let zIndex = 0;

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
            ev.stopPropagation();
            dragging = true;

            const { pageX, pageY } = ev;
            dragStart = [pageX - absPos[0], pageY - absPos[1]];
            absPos = [pageX - dragStart[0], pageY - dragStart[1]];

            el.style.setProperty("--drag-x", `${absPos[0]}px`);
            el.style.setProperty("--drag-y", `${absPos[1]}px`);
            el.style.setProperty("--drag-z-index", `${++zIndex}`);
        }
    }

    el.addEventListener("mousedown", onMouseDown);

    function onMouseMove(ev: MouseEvent) {
        if (dragging && ev.button === MOUSE_PRIMARY_BTN) {
            ev.stopPropagation();
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

    function dragEnd() {
        dragging = false;
        el.classList.remove("dragging");
    }

    el.addEventListener("mouseup", dragEnd);
    el.addEventListener("mouseleave", dragEnd);

    return () => {
        el.removeEventListener("mousedown", onMouseDown);
        el.removeEventListener("mousemove", onMouseMove);
        el.removeEventListener("mouseup", dragEnd);
        el.removeEventListener("mouseleave", dragEnd);
    };
}

export default Draggable;