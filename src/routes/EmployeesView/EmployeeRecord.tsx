import { Employee, Skill } from '../../gen/employee';
import { currencyDisplay } from '../../utils';
import "./EmployeesView.css";

type Props = {
    companyName: string;
    employee: Employee;
};


export default function EmployeeCard({ companyName, employee: emp }: Props) {
    function skillCheckmark(skill: Skill) {
        return <span>{emp.skills.has(skill) ? "☑" : "☐"}</span>;
    }

    return <table className='employee-record-sheet document'>
        <thead>
            <tr>
                <th className='flavor-text'>
                    <div>{companyName}</div>
                </th>
                <th colSpan={3} className='document-title'>Record of Employment</th>
                <th className='flavor-text'>
                    <div>FORM E68 - Rev.</div>
                    <div>778 (C.T.W. - 004)</div>
                </th>
            </tr>
            <tr>
                <th scope="row" colSpan={2}>Emp. Name <span className='handwritten'>{emp.fullName()}</span></th>
                <td>Emp. № 24</td>
                <th scope="row">Date of Hire</th>
                <td className='handwritten'>March 23rd 1859</td>
            </tr>
            <tr>
                <th colSpan={5}>
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
                        <button disabled>Cut</button>
                        <span>{currencyDisplay(emp.hourlyWage)}/hr</span>
                        <button disabled>Raise</button>
                    </div>
                </td>
                <td>✯✯✯</td>
            </tr>
            <tr>
                <th scope="row">Skills:</th>
                <th scope="col" className="skill-field">
                    <div>
                        <label>Teamster</label>
                        {skillCheckmark("Teamster")}
                    </div>
                </th>
                <th scope="col" className="skill-field">
                    <div>
                        <label>Accounting</label>
                        <span>{skillCheckmark("Accounting")}</span>
                    </div>
                </th>
                <th scope="col" className="skill-field">
                    <div>
                        <label>Laborer</label>
                        <span>{skillCheckmark("Laborer")}</span>
                    </div>
                </th>
                <th scope="col" className="skill-field">
                    <div>
                        <label>Security</label>
                        <span>{skillCheckmark("Security")}</span>
                    </div>
                </th>
            </tr>
            <tr><th scope='col' colSpan={5} className='section-div-row'>Biographical Information</th></tr>
            <tr>
                <th scope="row">Age</th><td className='handwritten'>{emp.age}</td>
                <th scope="row">Prospects</th><td colSpan={2} className='handwritten'>{
                    emp.poorMoral() ? "desperate" : emp.goodMoral() ? "positive" : "unknown"
                }</td>
            </tr>
            <tr>
                <th scope="row">Race</th><td className='handwritten'>White</td>
                <th scope="row">Dependants</th><td colSpan={2} className='handwritten'> spouse, 3 ch., 1 elder</td>
            </tr>
            <tr>
                <th scope="row">Sex</th><td className='handwritten'>{emp.sexDescriptor()}</td>
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
                <th colSpan={5}>
                    <div className='classified-notice'>MANAGEMENT EYES ONLY</div>
                </th>
            </tr>
            <tr>
                <td colSpan={5}>
                    <p className="flavor-text">Hemlock Printing Co.</p>
                    <p className="flavor-text">Redistribution strictly prohibited</p>
                </td>
            </tr>
        </tfoot>
    </table>;
}