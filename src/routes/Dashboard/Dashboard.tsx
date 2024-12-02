import { NavLink, Outlet, useLoaderData } from 'react-router-dom';
import { BANK, PLAYER_ACCT } from '../../model/BankAcct';
import { PLAYER_INFO, PlayerInfo } from '../../model/PlayerInfo';
import { RESET_ALL_STORAGE } from '../../model/storage-template';
import { Commodity, commodityUnitWeight, Inventory, Weight } from '../../model/Commodities';
import { PLAYER_INVENTORY } from '../../model/PlayerInventory';
import { CARAVAN } from '../../model/PlayerCaravan';
import './Dashboard.css';
import CargoMeter from '../../components/CargoMeter';
import React, { SetStateAction, useContext, useState } from 'react';

type LoaderRetTy = {
    playerAccountBalance: number;
    playerInfo: PlayerInfo;
    playerInventory: Inventory;
    caravanCapacity: Weight;
};

export async function dashboardLoader(): Promise<LoaderRetTy> {
    return {
        playerAccountBalance: await BANK.getAcctBalance(PLAYER_ACCT),
        playerInfo: await PLAYER_INFO.get(),
        playerInventory: await PLAYER_INVENTORY.get(),
        caravanCapacity: await CARAVAN.cargoCapacity(),
    };
}

type TxnWeightCtx = {
    setTxnWeight: React.Dispatch<React.SetStateAction<Weight>>;
    overCapacity: boolean;
};

export const SetTxnWeight = React.createContext<TxnWeightCtx>({
    setTxnWeight: () => { },
    overCapacity: false,
});

export default function Dashboard() {
    const { playerAccountBalance, playerInfo, playerInventory, caravanCapacity } = useLoaderData() as LoaderRetTy;

    const [txnWeight, setTxnWeight] = useState(Weight.fromLbs(0));

    const links = {
        map: 'Map',
        market: 'Market',
        cargo: 'Cargo',
        caravan: 'Caravan',
        employees: 'Employees',
        "wagon-shop": "Wagon Shop",
        "town": "Town Overview",
    };

    let cargoWeight = Weight.fromLbs(0);
    for (const commKey in playerInventory) {
        const comm = commKey as Commodity;
        const qty = playerInventory[comm] ?? 0;
        cargoWeight = cargoWeight.plus(commodityUnitWeight(comm).times(qty));
    }

    cargoWeight = cargoWeight.plus(txnWeight);
    const overCapacity = cargoWeight.inLbs() > caravanCapacity.inLbs();

    return (
        <div className="dashboard-wrapper">
            <aside className="dashboard-sidebar">
                <nav>
                    {Object.entries(links).map(([to, label]) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={activePendingClass}
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <section>
                    <table className="document">
                        <thead>
                            <tr><td colSpan={2}>{playerInfo.companyName}</td></tr>
                            <tr><td colSpan={2}>Owner: {playerInfo.playerName}</td></tr>
                        </thead>
                        <tr>
                            <th scope="row">Bank Balance</th>
                            <td>${playerAccountBalance.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <th scope="col" colSpan={2}>Caravan</th>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <div>Cargo & Capacity</div>
                                <CargoMeter
                                    cargo={cargoWeight}
                                    capacity={caravanCapacity}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Employees</th>
                            <td>12</td>
                        </tr>
                    </table>
                </section>
                <section>
                    <button
                        onClick={RESET_ALL_STORAGE}
                    >Clear All Save Data</button>
                </section>
            </aside>
            <main className='dashboard-outlet'>
                <SetTxnWeight.Provider value={{ overCapacity, setTxnWeight }}>
                    <div>
                        <Outlet />
                    </div>
                </SetTxnWeight.Provider>
            </main>
        </div>
    );
}

export function activePendingClass(
    { isActive, isPending, isTransitioning }:
        { isActive: boolean, isPending: boolean; isTransitioning: boolean; }
): string {
    return [
        isPending ? 'pending' : '',
        isActive ? 'active' : '',
        isTransitioning ? 'transitioning' : '',
    ].join(' ');
}
