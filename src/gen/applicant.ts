import { Employee } from './employee';
import { randInt, randNormal } from '../utils';

export class Applicant {
    employee: Employee;
    startDelay: number;
    desiredWorkdays: number;
    signOnBonus: number;

    constructor(employee: Employee, startDelay: number, desiredWorkdays: number, signOnBonus: number = 0.0) {
        this.employee = employee;
        this.startDelay = startDelay;
        this.desiredWorkdays = desiredWorkdays;
        this.signOnBonus = signOnBonus;
    }

    static generate(): Applicant {
        const employee = Employee.generate();
        const maxDelay = 5;
        const startDelay = randInt(0, maxDelay);

        // A shorter start delay increases the sign-on bonus.
        const signOnBonus = Math.max(
            randNormal(7.50, 1.0) * (1 - (startDelay + 1) / maxDelay) * 4,
            0
        );
        return new Applicant(
            employee,
            startDelay,
            randInt(2, 6),
            Math.round(signOnBonus) / 4
        );
    }
}