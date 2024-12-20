import { Employee } from './employee';
import { Applicant } from './applicant';
import { DefaultMap, randInt, randNormal, randChoice, randSample } from '../utils';

type EmpEvent = void;

export class Company {
    employees: Set<Employee>;
    scheduledToday: Set<Employee>;
    cantBeScheduledForDays: DefaultMap<Employee, number>;
    desiredWorkdaysPerWeek: Map<Employee, number>;
    eventHistory: Array<Array<EmpEvent>>;
    weeklyHoursWorked: DefaultMap<Employee, number>;
    dayOfWeek: number;
    hourlyWage: number;
    dailyPunchcard: DefaultMap<Employee, number>;
    weeklyOperatingExpenses: number;
    hourlyRevenue: number;

    constructor() {
        this.employees = new Set();
        this.scheduledToday = new Set();
        this.cantBeScheduledForDays = new DefaultMap(() => 0);
        this.desiredWorkdaysPerWeek = new Map();
        this.eventHistory = [];
        this.weeklyHoursWorked = new DefaultMap(() => 0);
        this.dayOfWeek = 0;
        this.hourlyWage = 1.35 / 8;
        this.dailyPunchcard = new DefaultMap(() => 0);
        this.weeklyOperatingExpenses = 21.00;
        this.hourlyRevenue = 0.25;

        const numEmployees = randInt(5, 10);
        for (let i = 0; i < numEmployees; i++) {
            this.hire(Employee.generate());
        }

        for (const employee of this.employees) {
            this.cantBeScheduledForDays.set(employee, randInt(0, 3));
        }
    }

    hire(eOrA: Employee | Applicant, startDelay: number = randInt(0, 5), desiredWorkdays: number = randInt(3, 6)) {
        let e: Employee;

        if (eOrA instanceof Applicant) {
            startDelay = eOrA.startDelay;
            desiredWorkdays = eOrA.desiredWorkdays;
            e = eOrA.employee;
        } else {
            e = eOrA;
        }

        const sameName = Array.from(this.employees).filter(o => o.firstName === e.firstName);
        if (sameName.length > 0) {
            const usedNamesAndNicknames = new Set(Array.from(this.employees)
                .flatMap(o => o.nickname ? [o.firstName, o.nickname] : [o.firstName])
            );
            Employee.giveDistinguishingNicknames(sameName, usedNamesAndNicknames);
        }

        this.desiredWorkdaysPerWeek.set(e, desiredWorkdays);
        this.cantBeScheduledForDays.set(e, startDelay);
        this.employees.add(e);
    }

    startOfDay() {
        this.eventHistory.push([]);
        this.createTodaysSchedule();
        this.dailyPunchcard = new DefaultMap(() => 0);
    }

    endOfDay(): number {
        this.dayOfWeek = (this.dayOfWeek + 1) % 7;

        let totalLaborHours = 0;

        for (const employee of this.scheduledToday) {
            this.weeklyHoursWorked.set(employee, this.weeklyHoursWorked.get(employee) + 8);
            totalLaborHours += 8;
        }

        for (const [employee, hoursWorked] of this.dailyPunchcard.entries()) {
            this.weeklyHoursWorked.set(employee, this.weeklyHoursWorked.get(employee) + hoursWorked);
            totalLaborHours += hoursWorked;
        }

        for (const [employee, daysTillScheduled] of this.cantBeScheduledForDays.entries()) {
            if (daysTillScheduled > 0) {
                this.cantBeScheduledForDays.set(employee, daysTillScheduled - 1);
            }
        }

        return totalLaborHours;
    }

    endOfWeek(): string {
        let output = "END OF WEEK\n";
        output += "-----------\n";
        output += `Employee | Hrs | Wage | Pay ($)\n`;
        output += "-".repeat(60) + "\n";
        let totalPay = 0.00;
        let totalLaborHours = 0;

        for (const [employee, hours] of this.weeklyHoursWorked.entries()) {
            const pay = hours * employee.hourlyWage;
            totalPay += pay;
            totalLaborHours += hours;
            output += `${employee.fullName()} | ${hours} | ${employee.hourlyWage.toFixed(2)} | ${pay.toFixed(2)}\n`;
        }

        output += "-".repeat(60) + "\n";
        output += `Totals | ${totalLaborHours} | -- | ${totalPay.toFixed(2)}\n`;

        const unscheduled = Array.from(this.employees).filter(e => this.weeklyHoursWorked.get(e) === 0);
        if (unscheduled.length > 0) {
            output += "Unscheduled employees:\n";
            unscheduled.forEach(e => output += `${e.fullName()}\n`);
        }

        output += "\n";
        const operatingCosts = randNormal(this.weeklyOperatingExpenses, 2.00);
        const expenses = operatingCosts + totalPay;
        const revenue = totalLaborHours * randNormal(this.hourlyRevenue, 0.05);
        const profit = revenue - expenses;
        output += `Expenses: ${expenses.toFixed(2)}\n`;
        output += `Wages: ${totalPay.toFixed(2)}\n`;
        output += `Operating: ${operatingCosts.toFixed(2)}\n`;
        output += `Revenue: ${revenue.toFixed(2)}\n`;
        output += `Profit: ${profit.toFixed(2)}\n`;

        this.weeklyHoursWorked = new DefaultMap(() => 0);

        return output;
    }

    minShiftSize(): number {
        // An estimate aiming to break even (profit = 0).
        const daysLeftInWeek = 7 - (this.dayOfWeek % 7);
        const hoursLeftInWeek = daysLeftInWeek * 8;
        return Math.ceil(
            this.weeklyOperatingExpenses / (hoursLeftInWeek * (this.hourlyRevenue - this.hourlyWage))
        );
    }

    createTodaysSchedule() {
        this.scheduledToday = new Set();

        const employeesStillNeeded = () => this.minShiftSize() - this.scheduledToday.size;

        const schedulable = Array.from(this.employees)
            .filter(e => this.employeeSchedulable(e))
            .filter(e => this.employeeUnderDesiredWeeklyHours(e));

        if (schedulable.length === 0) {
            const hoursOverDesired = (e: Employee) => {
                const desiredHours = this.desiredWorkdaysPerWeek.get(e)! * 8;
                const currentHours = this.weeklyHoursWorked.get(e);
                return currentHours - desiredHours;
            };

            // Nobody else can be scheduled. We'll have to ask someone to work an extra shift.
            const notUnschedulable = Array.from(this.employees)
                .filter(e => !this.scheduledToday.has(e))
                .filter(e => this.employeeSchedulable(e))
                .sort((e1, e2) => hoursOverDesired(e1) - hoursOverDesired(e2));

            randSample(employeesStillNeeded(), notUnschedulable).forEach(e => {
                this.scheduledToday.add(e);
                e.moral -= randNormal(0.1, 0.05, [0, 0.5]);
            });
        }
    }

    employeeSchedulable(employee: Employee): boolean {
        return this.cantBeScheduledForDays.get(employee) === 0;
    }

    employeeUnderDesiredWeeklyHours(employee: Employee): boolean {
        return this.weeklyHoursWorked.get(employee) < this.desiredWorkdaysPerWeek.get(employee)! * 8;
    }
}