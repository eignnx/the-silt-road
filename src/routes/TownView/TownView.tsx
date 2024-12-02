import { useLoaderData } from 'react-router-dom';
import { Business, DemandsSupplies, INDUSTRIES_DEMANDS_SUPPLIES, TOWN_BUSINESSES } from '../../model/Industries';
import { WORLD_MAP } from '../../model/Towns';

import "./TownView.css";
import { Commodity, Inventory } from '../../model/Commodities';
import { objectEntries, titleCase } from '../../utils';
import { link } from 'fs';

type LoaderData = {
    townBusinesses: Business[],
    currentTown: string,
};

export async function townViewLoader(): Promise<LoaderData> {
    const currentTown = await WORLD_MAP.getPlayerLocation();
    const allTownBusinesses = await TOWN_BUSINESSES.get();
    console.log("allTownBusinesses", allTownBusinesses);
    return {
        townBusinesses: allTownBusinesses[currentTown] ?? [],
        currentTown,
    };
}

export async function townViewAction() { }

function computeTownDemandsAndSupplies(townBusinesses: Business[]): { netSupplies: Inventory; } {
    const townDemandsSupplies: { netSupplies: Inventory; } = {
        netSupplies: {},
    };

    for (const business of townBusinesses) {
        const { demands, supplies } = INDUSTRIES_DEMANDS_SUPPLIES[business];
        for (const comm of demands) {
            townDemandsSupplies.netSupplies[comm] = (townDemandsSupplies.netSupplies[comm] ?? 0) - 1;
        }
        for (const comm of supplies) {
            townDemandsSupplies.netSupplies[comm] = (townDemandsSupplies.netSupplies[comm] ?? 0) + 1;
        }
    }

    return townDemandsSupplies;
}

export default function TownView() {
    const { townBusinesses, currentTown } = useLoaderData() as LoaderData;

    const townDemandsSupplies = computeTownDemandsAndSupplies(townBusinesses);

    return <div className="town-view">
        <h1>{currentTown}</h1>
        <h2>Silt County, CO</h2>
        <section className="buildings">
            {townBusinesses.map(business => (
                <div className="building">
                    <h3>{business}</h3>
                </div>
            ))}
        </section>
        <section>
            <h3>Supplies & Demands</h3>
            <ul>
                {objectEntries(townDemandsSupplies.netSupplies)
                    .sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))
                    .map(([comm, qty]) => (
                        (qty === undefined) ? null
                            : (qty > 0) ? <li>Supplies {qty}x {titleCase(comm)}</li>
                                : <li>Demands {-qty}x {titleCase(comm)}</li>
                    ))}
            </ul>
        </section>
    </div>;
}
