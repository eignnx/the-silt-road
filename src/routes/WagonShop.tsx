import { useLoaderData } from 'react-router-dom';
import { displayWagon, Wagon } from '../model/PlayerCaravan';
import { titleCase } from '../utils';
import "../styles/WagonShop.css";

type LoaderData = {};

export async function wagonShopLoader(): Promise<LoaderData> {
    return {};
}

export async function wagonShopAction() { }

type WagonForSale = {
    kind: Wagon,
    condition: string,
    cargoCapTons: number,
    dryWeightTons: number,
    passengerCap: number,
    price: number,
};

export default function WagonShopPage() {
    const { } = useLoaderData() as LoaderData;

    const wagonsForSale: WagonForSale[] = [
        {
            kind: "conestoga",
            condition: "worn",
            cargoCapTons: 8,
            passengerCap: 4,
            dryWeightTons: 2,
            price: 225.00,
        },
        {
            kind: "cart",
            condition: "like new",
            cargoCapTons: 1,
            passengerCap: 1,
            dryWeightTons: 0.35,
            price: 35.00,
        },
        {
            kind: "conestoga",
            condition: "worn",
            cargoCapTons: 8,
            passengerCap: 4,
            dryWeightTons: 2,
            price: 225.00,
        },
        {
            kind: "cart",
            condition: "like new",
            cargoCapTons: 1,
            passengerCap: 1,
            dryWeightTons: 0.35,
            price: 35.00,
        },
        {
            kind: "conestoga",
            condition: "worn",
            cargoCapTons: 8,
            passengerCap: 4,
            dryWeightTons: 2,
            price: 225.00,
        },
        {
            kind: "cart",
            condition: "like new",
            cargoCapTons: 1,
            passengerCap: 1,
            dryWeightTons: 0.35,
            price: 35.00,
        },
    ];

    return <>
        <h1>Wagon Shop</h1>
        <section id="wagon-shop" className="document-grid" data-cell-width="100px">
            {wagonsForSale.map((w, idx) => (
                <table key={idx} className='document'>
                    <thead>
                        <tr>
                            <th colSpan={3}>
                                <h4>
                                    {titleCase(displayWagon(w.kind))}
                                </h4>
                                <span>Condition: {titleCase(w.condition)}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="col">Cargo Capacity</th>
                            <th scope="col">Dry Weight</th>
                            <th scope="col">Passenger Accomidation</th>
                        </tr>
                        <tr>
                            <td>{w.cargoCapTons} tn.</td>
                            <td>{w.dryWeightTons} tn.</td>
                            <td>{w.passengerCap} passengers</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th scope="row">Price</th>
                            <td>${w.price.toFixed(2)}</td>
                            <td>
                                <button>
                                    Purchase
                                </button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            ))}
        </section>
    </>;
}