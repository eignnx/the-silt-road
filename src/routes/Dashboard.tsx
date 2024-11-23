import { NavLink, Outlet, useLoaderData } from 'react-router-dom';
import '../styles/Dashboard.css';
import { BANK, PLAYER_ACCT } from '../model/BankAcct';
import { PLAYER_INFO, PlayerInfo } from '../model/PlayerInfo';

type LoaderRetTy = {
    playerAccountBalance: number;
    playerInfo: PlayerInfo;
};

export async function dashboardLoader(): Promise<LoaderRetTy> {
    return {
        playerAccountBalance: await BANK.getAcctBalance(PLAYER_ACCT),
        playerInfo: await PLAYER_INFO.getPlayerInfo(),
    };
}

export default function Dashboard() {
    const { playerAccountBalance, playerInfo } = useLoaderData() as LoaderRetTy;

    const links = {
        map: 'Map',
        market: 'Market',
        cargo: 'Cargo',
        caravan: 'Caravan',
        employees: 'Employees',
    };

    const cargoWeight = 1200;
    const cargoCapacity = 4475;

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
                    <table>
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
                                <div>{cargoWeight}lbs / {cargoCapacity}lbs</div>
                                <div>
                                    <meter
                                        min={0}
                                        max={cargoCapacity}
                                        value={cargoWeight}
                                        optimum={0}
                                        high={cargoCapacity * 0.9}
                                    >{cargoWeight}/{cargoCapacity}</meter>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Employees</th>
                            <td>12</td>
                        </tr>
                    </table>
                </section>
            </aside>
            <main className='dashboard-outlet'>
                <div>
                    <Outlet />
                </div>
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
