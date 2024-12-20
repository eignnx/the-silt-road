import { ActionFunction, useLoaderData } from 'react-router-dom';
import { PLAYER_INFO } from '../../model/PlayerInfo';
import { Company } from '../../gen/company';
import React from 'react';
import { Employee, Skill } from '../../gen/employee';
import { currencyDisplay } from '../../utils';

import "./EmployeesView.css";
import EmployeeCard from './EmployeeRecord';

const company = new Company();

type LoaderData = {
    companyName: string;
    company: Company;
};

export async function employeesViewLoader(): Promise<LoaderData> {
    return {
        companyName: await PLAYER_INFO.getCompanyName(),
        company,
    };
}

export async function employeesViewAction({ request }: { request: Request; }) {
    return null;
}

export default function EmployeesView() {
    const { companyName, company } = useLoaderData() as LoaderData;

    return <>
        {Array.from(company.employees).map(emp => (
            <EmployeeCard companyName={companyName} employee={emp} />
        ))}
    </>;
}
