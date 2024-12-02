import { useLoaderData } from 'react-router-dom';
import { Business, TOWN_BUSINESSES } from '../../model/Industries';
import { WORLD_MAP } from '../../model/Towns';

import "./TownView.css";

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

export default function TownView() {
    const { townBusinesses, currentTown } = useLoaderData() as LoaderData;

    return <div className="town-view">
        <h1>{currentTown}</h1>
        <h2>Silt County, CO</h2>
        <div className="buildings">
            {townBusinesses.map(business => (
                <div className="building">
                    <h3>{business}</h3>
                </div>
            ))}
        </div>
    </div>;
}
