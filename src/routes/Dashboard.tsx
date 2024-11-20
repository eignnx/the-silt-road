import { NavLink, Outlet, useLoaderData } from 'react-router-dom';
import '../styles/Dashboard.css';
import { BANK, PLAYER_ACCT } from '../model/BankAcct';

type LoaderRetTy = {
    playerAccountBalance: number;
};

export async function dashboardLoader(): Promise<LoaderRetTy> {
    return {
        playerAccountBalance: await BANK.getAcctBalance(PLAYER_ACCT)
    };
}

export default function Dashboard() {
    const { playerAccountBalance } = useLoaderData() as LoaderRetTy;

    const links = {
        market: 'Market',
        cargo: 'Cargo',
        caravan: 'Caravan',
    };

    const cargoWeight = 1234;
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
                            <tr><td colSpan={2}>Homer S. McCoy</td></tr>
                            <tr><td colSpan={2}>McCoy & Sons Conveyance Co.</td></tr>
                        </thead>
                        <tr>
                            <th scope="row">Bank Balance</th>
                            <td>${playerAccountBalance.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <th scope="col" colSpan={2}>Cargo / Capacity</th>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <div>
                                    <div>
                                        234lbs / 4475lbs
                                    </div>
                                    <meter
                                        min={0}
                                        max={cargoCapacity}
                                        value={cargoWeight}
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
                <Outlet />
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
