import React from 'react';
import { arraySwapRemove } from '../utils';
import { MakeStorage } from './storage-template';
import { useSubmit } from 'react-router-dom';

export const DAYS_OF_WEEK = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export function dayOfWeekOrdinal(dow: DayOfWeek): number {
    return DAYS_OF_WEEK.findIndex(x => x === dow)!;
}

export function dayOfWeekOffset(dow: DayOfWeek, offset: number): DayOfWeek {
    return DAYS_OF_WEEK[(dayOfWeekOrdinal(dow) + offset) % 7];
}

export function nextDayOfWeek(dow: DayOfWeek): DayOfWeek {
    return dayOfWeekOffset(dow, +1);
}

export function prevDayOfWeek(dow: DayOfWeek): DayOfWeek {
    return dayOfWeekOffset(dow, -1);
}

type Date = {
    dayOrdinal: number;
    dayOfWeek: DayOfWeek;
};


const TIMES_OF_DAY = [
    "Dawn",
    "Midday",
    "Dusk",
    "Midnight",
] as const;

export type TimeOfDay = typeof TIMES_OF_DAY[number];

/**
 * 
 * @param timeOfDay 
 * @returns A pair `{next, wrap}` where `next` is the next time of day, and `wrap` is true if the day rolled over.
 */
export function nextTimeOfDay(timeOfDay: TimeOfDay): { next: TimeOfDay, wrap: boolean; } {
    const index = TIMES_OF_DAY.findIndex(t => t === timeOfDay)!;
    const wrap = index + 1 >= TIMES_OF_DAY.length;
    const next = TIMES_OF_DAY[(index + 1) % TIMES_OF_DAY.length];
    return { next, wrap };
}

type TimeOfDayTrigger = TimeOfDay | "any";

type Observer = (time: Time) => void;

type Observers = {
    [event in TimeOfDayTrigger]: {
        observer: Observer,
        recurrent: boolean;
    }[]
};

const observers: Observers = {
    "Dawn": [],
    "Midday": [],
    "Dusk": [],
    "Midnight": [],
    "any": [],
};

export type Time = {
    timeOfDay: TimeOfDay,
    dayOfWeek: DayOfWeek,
    dayOrdinal: number,
};

const SEED: Time = {
    timeOfDay: "Dawn",
    dayOfWeek: "Friday",
    dayOrdinal: 0,
};

export const TIME = {
    ...MakeStorage<Time>({
        resourceKey: "DATE",
        seedValue: SEED,
    }),

    async progressToNextTimeOfDay() {
        const state = await this.get();
        progressToNextTimeOfDay_impl(state);
        notifyObservers(state);
        await this.replace(state);
    },

    async progressUntil(untilNext: TimeOfDay) {
        const state = await this.get();

        do {
            progressToNextTimeOfDay_impl(state);
            notifyObservers(state);
        } while (state.timeOfDay !== untilNext);

        await this.replace(state);
    },

    /**
     * 
     * @param updateOn The event trigger for updates of the calling component.
     * @returns The current time
     */
    useTime(updateOn: TimeOfDayTrigger): Time | "loading" {
        const [time, setTime] = React.useState<Time | "loading">("loading");

        React.useEffect(() => {
            scheduleRecurring(updateOn, setTime);

            // On component load, asynchronously begin fetching the current time
            // from localStorage.
            this.get().then(setTime);

            return () => unschedule(updateOn, setTime);
        }, []);

        return time;
    },
};


function progressToNextTimeOfDay_impl(state: { timeOfDay: TimeOfDay, dayOrdinal: number, dayOfWeek: DayOfWeek; }) {
    const { next, wrap } = nextTimeOfDay(state.timeOfDay);
    state.timeOfDay = next;
    if (wrap) {
        state.dayOrdinal++;
        state.dayOfWeek = nextDayOfWeek(state.dayOfWeek);
    }
}

function scheduleRecurring(onEvent: TimeOfDayTrigger, observer: Observer) {
    observers[onEvent].push({ observer, recurrent: true });
}

function scheduleOnce(onEvent: TimeOfDayTrigger, observer: Observer) {
    observers[onEvent].push({ observer, recurrent: false });
}

function unschedule(onEvent: TimeOfDayTrigger, observer: Observer) {
    const eventObservers = observers[onEvent];
    const idx = eventObservers.findIndex(({ observer: o }) => o === observer);
    if (idx !== undefined) {
        arraySwapRemove(eventObservers, idx);
    } else {
        throw new Error("Can't find the given event observer to unregister!");
    }
}

function notifyObservers(state: Time) {
    const eventObservers = observers[state.timeOfDay].concat(observers["any"]);
    const toRemove = [];

    for (const [idx, { observer, recurrent }] of eventObservers.entries()) {
        observer(state);

        if (!recurrent) {
            toRemove.push(idx);
        }
    }

    for (const idx of toRemove) {
        arraySwapRemove(eventObservers, idx);
    }
}
