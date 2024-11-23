import { redirect, useLoaderData, useSubmit } from 'react-router-dom';
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
    console.log(_action, formData);

    if (_action === "playerTravelToTown") {
        WORLD_MAP.setPlayerPos(formData.dest);
        return redirect("");
    } else {
        throw new Error(`SILT_ROAD: unknown action request data: ${formData}`);
    }
}

export default function MapView() {
    const { worldMap } = useLoaderData() as LoaderRetTy;

    const submit = useSubmit();

    function playerInTown(townName: string): boolean {
        return typeof worldMap.playerLocation === "string"
            && worldMap.playerLocation === townName;
    }

    function handleTownClick(dest: string) {
        const payload = { _action: "playerTravelToTown", dest };
        console.log(payload);
        submit(
            payload,
            {
                encType: "application/json",
                method: "POST",
            }
        );
    }


    return (
        <article id="map-view" className='document'>
            <h1>Silt County</h1>
            <svg
                className="inner-map-container"
                xmlns="http://www.w3.org/2000/svg"
            >
                {worldMap.towns.map(town => (
                    <svg
                        width="20%"
                        height="20%"
                        x={`${town.coords.x - 10}%`}
                        y={`${town.coords.y - 10}%`}
                    >
                        <text
                            textAnchor='middle'
                            dominantBaseline="hanging"
                            x="50%"
                            y={"55%"}
                            aria-description={
                                playerInTown(town.name) ? "You are here." : undefined
                            }
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
                            onClick={() => handleTownClick(town.name)}
                        />
                    </svg>
                ))}
            </svg>
        </article>
    );
}