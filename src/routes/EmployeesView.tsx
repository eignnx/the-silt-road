import { useLoaderData } from 'react-router-dom';

import "../styles/EmployeesView.css";
import { PLAYER_INFO } from '../model/PlayerInfo';
import { titleCase } from '../utils';

type LoaderRetTy = { companyName: string; };

export async function employeesViewLoader(): Promise<LoaderRetTy> {
    return {
        companyName: await PLAYER_INFO.getCompanyName(),
    };
}

export async function employeesViewAction({ response }: any) {
    return null;
}

export default function EmployeesView() {
    let { companyName } = useLoaderData() as LoaderRetTy;

    const ALL_SKILLS = ["teamster", "cook", "laborer", "hired gun"];

    const employees = [
        { name: "Russel O'Connor", skills: ["cook", "laborer"] },
        { name: "Claire Vandermonde", skills: ["teamster", "cook", "laborer", "hired gun"] },
        { name: "Hezekiah P. Smith", skills: ["hired gun"] },
        { name: "Judith Damascus", skills: ["laborer"] },
    ];

    return <>
        {employees.map(emp => (
            <table className='employee-record-sheet document'>
                <thead>
                    <tr>
                        <th className='header-flavor-text'>
                            <div>{companyName}</div>
                        </th>
                        <th colSpan={3} className='document-title'>Record of Employment</th>
                        <th className='header-flavor-text'>
                            <div>FORM E68 - Rev.</div>
                            <div>778 (C.T.W. - 004)</div>
                        </th>
                    </tr>
                    <tr>
                        <th scope="row">Emp. Name</th><td className='handwritten'>{emp.name}</td>
                        <td>Emp. № 24</td>
                        <th scope="row">Date of Hire</th>
                        <td className='handwritten'>March 23rd 1859</td>
                    </tr>
                    <tr>
                        <th colSpan={5} >
                            <div className='classified-notice'>MANAGEMENT EYES ONLY</div>
                            <div className='fineprint'>Violation of confidentiality subject to disciplanary action up to and including termination of employment.</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr><th scope="col" colSpan={5} className='section-div-row'>Company Assets</th></tr>
                    <tr>
                        <th scope="row">Position</th>
                        <td className='handwritten'>Agent</td>
                        <th scope="row">Wage (hourly)</th>
                        <td colSpan={1}>
                            <div className='flex-evenly'>
                                <button>Cut</button>
                                <span>72¢</span>
                                <button>Raise</button>
                            </div>
                        </td>
                        <td>✯✯✯</td>
                    </tr>
                    <tr>
                        <th scope="row" rowSpan={2}>Skills:</th>
                        <th scope="col">Teamster</th>
                        <th scope="col">Cook</th>
                        <th scope="col">Laborer</th>
                        <th scope="col">Security</th>
                    </tr>
                    <tr>
                        <td className='handwritten'>{emp.skills.includes("teamster") ? "X" : ""}</td>
                        <td className='handwritten'>{emp.skills.includes("cook") ? "X" : ""}</td>
                        <td className='handwritten'>{emp.skills.includes("laborer") ? "X" : ""}</td>
                        <td className='handwritten'>{emp.skills.includes("hired gun") ? "X" : ""}</td>
                    </tr>
                    <tr><th scope='col' colSpan={5} className='section-div-row'>Biographical Information</th></tr>
                    <tr>
                        <th scope="row">Age</th><td className='handwritten'>47</td>
                        <th scope="row">Prospects</th><td colSpan={2} className='handwritten'>desperate</td>
                    </tr>
                    <tr>
                        <th scope="row">Race</th><td className='handwritten'>White</td>
                        <th scope="row">Dependants</th><td colSpan={2} className='handwritten'> spouse, 3 ch., 1 elder</td>
                    </tr>
                    <tr>
                        <th scope="row">Sex</th><td className='handwritten'>F</td>
                        <th scope="row">Est. Assets</th><td colSpan={2} className='handwritten'>$27</td>
                    </tr>
                    <tr>
                        <th scope="row">Marrital St.</th><td className='handwritten'>married</td>
                        <th scope="row">Company Debt</th><td colSpan={2} className='handwritten'>$9.00</td>
                    </tr>
                    <tr><th scope="col" colSpan={5} className='section-div-row'>Notes</th></tr>
                    <tr>
                        <th colSpan={4}>Disciplinary Action</th>
                        <th>Date</th>
                    </tr>
                    <tr>
                        <td colSpan={4} rowSpan={3}>
                            <p className='handwritten'>
                                Confrunted about tardyness, refused to sine ack.ment of disiplin.
                            </p>
                        </td>
                        <td className='handwritten'>4/1/59</td>
                    </tr>
                    <tr></tr>
                    <tr></tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th colSpan={5} >
                            <div className='classified-notice'>MANAGEMENT EYES ONLY</div>
                        </th>
                    </tr>
                    <tr>
                        <td colSpan={5}>
                            <p>Hemlock Printing Co.</p>
                            <p>Redistribution Prohibited</p>
                        </td>
                    </tr>
                </tfoot>
            </table>
        ))}
    </>;
}