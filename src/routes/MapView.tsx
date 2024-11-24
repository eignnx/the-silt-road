import { redirect, useLoaderData, useNavigate, useSubmit } from 'react-router-dom';
import { WORLD_MAP, WorldMap } from "../model/Towns";
import "../styles/MapView.css";
import { useEffect, useState } from 'react';

type LoaderRetTy = {
    worldMap: WorldMap;
};

export async function mapViewLoader(): Promise<LoaderRetTy> {
    return {
        worldMap: await WORLD_MAP.getWorldMap()
    };
}

export async function mapViewAction({ request }: { request: any; }) {
    const { _action, ...formData } = await request.json();

    if (_action === "playerTravelToTown") {
        WORLD_MAP.setPlayerLocation(formData.dest);
        return redirect("");
    } else {
        throw new Error(`SILT_ROAD: unknown action request data: ${formData}`);
    }
}

export default function MapView() {
    const { worldMap } = useLoaderData() as LoaderRetTy;

    const submit = useSubmit();
    const navigator = useNavigate();

    function playerInTown(townName: string): boolean {
        return typeof worldMap.playerLocation === "string"
            && worldMap.playerLocation === townName;
    }

    function handleTownClick(dest: string) {
        if (!playerInTown(dest)) {
            submit(
                { _action: "playerTravelToTown", dest },
                {
                    encType: "application/json",
                    method: "POST",
                }
            );
        } else {
            navigator("../market");
        }
    }

    return (
        <article id="map-view" className='document'>
            <h1>Silt County</h1>
            <svg
                className="inner-map-container"
                xmlns="http://www.w3.org/2000/svg"
                role="presentation"
            >
                {worldMap.towns.map(town => (
                    <svg
                        role="button"
                        width="20%"
                        height="20%"
                        x={`${town.coords.x - 10}%`}
                        y={`${town.coords.y - 10}%`}
                        tabIndex={0} // These elements should be navigable via TAB.
                        aria-label={`Travel to ${town.name}`}
                        aria-description={
                            playerInTown(town.name) ? "You are here." : undefined
                        }
                        onClick={() => handleTownClick(town.name)}
                        onKeyDown={e => { if (e.code === "Enter") handleTownClick(town.name); }}
                    >
                        <text
                            textAnchor='middle'
                            dominantBaseline="hanging"
                            x="50%"
                            y={"55%"}
                        >
                            {town.name}
                        </text>
                        <circle
                            className={[
                                "town-map-pin",
                                playerInTown(town.name)
                                    ? "player-in-town"
                                    : "",
                            ].join(" ")}
                            cx="50%"
                            cy="50%"
                            r="5"
                        />
                    </svg>
                ))}
            </svg>
        </article>
    );
}