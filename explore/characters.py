from abc import ABC, abstractmethod
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum
import random
from typing import Optional

from gen import Person


def main():
    c = Company.generate()
    c.day_of_week = 5
    while True:
        c.start_of_day()

        print()
        print(day_of_week(c.day_of_week))
        print("----------")

        print("Scheduled today:")
        for employee in c.scheduled_today:
            print(f"\t- {employee.full_name()}")
        confirm()

        events = random.choices(Event.__subclasses__(), k=random.randint(0, 3))
        for event_kind in events:
            e = event_kind.generate(c)
            try:
                e.print()
            except AttributeError:
                print("!!!", event_kind, "could not print", e)
                continue
            e.apply(c)
            confirm()

        if len(events) == 0:
            print("The day went by smoothly.")
            confirm()

        c.end_of_day()

        if c.day_of_week == 0:
            print("End of week.")
            confirm()

            print(f"{"Employee":^30} |{"Hrs":^5}| {"Pay ($)":^6}")
            print("-" * 50)
            total = 0.00
            for employee in c.weekly_hours_worked.keys():
                hours = c.weekly_hours_worked[employee]
                pay = hours * c.hourly_wage
                total += pay
                print(f"{employee.full_name():<30} | {hours:>3} | {pay:6.2f}")
            print("-" * 50)
            print(f"Total pay: ${total:.2f}")

            unscheduled = c.employees - set(c.weekly_hours_worked.keys())
            if unscheduled:
                print()
                print("Unscheduled employees:")
                for employee in unscheduled:
                    print(f"\t- {employee}")

            c.weekly_hours_worked = defaultdict(int)
            confirm()


def confirm():
    print()
    input("[Press ENTER to continue]")
    print()


def day_of_week(dow: int) -> str:
    return [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ][dow]


@dataclass
class Employee(Person):
    disposition_toward_company: float = 0.8

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, value: "Employee"):
        return super().__eq__(value)

    @staticmethod
    def generate():
        p = Person.generate()
        e = Employee(disposition_toward_company=random.uniform(0.5, 1.0), **p.__dict__)
        return e


@dataclass
class Company:
    employees: set[Employee]
    scheduled_today: set[Employee]
    days_till_next_scheduled: dict[Employee, int]
    days_worked_per_week: dict[Employee, int]

    weekly_hours_worked: defaultdict[Employee, int] = field(
        default_factory=lambda: defaultdict(int)
    )
    day_of_week: int = 0
    min_shift_size: int = 5
    max_shift_size: int = 10
    hourly_wage: float = 1.35 / 8  # $1.35 per hour (1860s dollars)

    @staticmethod
    def generate() -> "Company":
        n_emps = random.randint(5, 15)
        employees: set[Employee] = set()
        for _ in range(n_emps):
            e = Employee.generate()

            same_name = [o for o in employees if o.first_name == e.first_name]
            if same_name:
                Person.give_distinguishing_nicknames(
                    [e, *same_name], set(o.nickname for o in employees)
                )

            employees.add(e)

        days_worked_per_week = {
            employee: random.randint(1, 6) for employee in employees
        }
        days_till_next_scheduled = {
            employee: random.randint(0, 6) for employee in employees
        }
        scheduled_today = set(
            employee
            for employee, days_till_scheduled in days_till_next_scheduled.items()
            if days_till_scheduled == 0
        )

        return Company(
            employees=employees,
            scheduled_today=scheduled_today,
            days_till_next_scheduled=days_till_next_scheduled,
            days_worked_per_week=days_worked_per_week,
        )

    def end_of_day(self):
        self.day_of_week += 1
        self.day_of_week %= 7

        for employee in self.scheduled_today:
            self.days_worked_per_week[employee] += 1
            self.weekly_hours_worked[employee] += 8

    def start_of_day(self):
        while len(self.scheduled_today) < self.min_shift_size:
            for employee in self.employees:
                if (
                    self.weekly_hours_worked[employee]
                    < self.days_worked_per_week[employee] * 8
                ):
                    days_left_in_week = 7 - self.day_of_week
                    if self.days_worked_per_week[employee] >= days_left_in_week:
                        self.scheduled_today.add(employee)  # Definitely add them.
                    else:
                        if random.random() < 0.5:
                            self.scheduled_today.add(employee)
        if len(self.scheduled_today) > self.max_shift_size:
            self.scheduled_today = set(
                random.sample(list(self.scheduled_today), self.max_shift_size)
            )


def random_relative() -> str:
    return random.choice(
        ["son", "daughter", "mother", "father", "grandson", "granddaughter"]
    )


@dataclass
class Event(ABC):
    @abstractmethod
    def print(self):
        pass

    @abstractmethod
    def apply(self, company: Company):
        pass

    @staticmethod
    @abstractmethod
    def generate(company: Company) -> "Event":
        pass


@dataclass
class CallOut(Event):
    employee: Employee
    reason: str

    def print(self):
        print(f"{self.employee} called out. {self.reason}.")

    def apply(self, company: Company):
        company.scheduled_today.remove(self.employee)

    @staticmethod
    def generate(company: Company) -> Event:
        employee = random.choice(list(company.scheduled_today))
        reason = random.choice(
            [
                f"Said {employee.theyre} sick",
                f"Said {employee.their} {random_relative()} is sick",
                f"{employee.They} didn't give a reason",
            ]
        )
        return CallOut(employee=employee, reason=reason)


@dataclass
class Quitting(Event):
    employee: Employee
    reason: str
    worked_whole_day: bool = True

    def print(self):
        e = self.employee
        if self.worked_whole_day:
            print(f"At the end of {e.their} shift, {self.employee} quit. {self.reason}")
        else:
            print(
                f"{self.employee} quit part-way through {e.their} shift. {self.reason}"
            )

    def apply(self, company: Company):
        company.employees.remove(self.employee)
        if not self.worked_whole_day:
            company.weekly_hours_worked[self.employee] -= random.randint(2, 6)

    @staticmethod
    def generate(company: Company) -> Event:
        potential_quitters = [
            emp for emp in company.employees if emp.disposition_toward_company < 0
        ]
        if potential_quitters:
            employee = random.choice(potential_quitters)
        else:
            employee = random.choice(list(company.employees))

        e = employee
        if employee.disposition_toward_company > 0.1:
            worked_whole_day = True
            reason = random.choice(
                [
                    f"{e.They} said {e.they}'d found a better job.",
                    f"{e.They} said {e.theyre} moving out of town.",
                    f"{e.They} said {e.their} {random_relative()} requires more care now.",
                    f"{e.They} didn't give a reason.",
                ]
            )
        elif employee.disposition_toward_company < -0.5:
            worked_whole_day = False
            reason = random.choice(
                [
                    f"{e.They} said {e.theyre} done with this place.",
                    f"{e.They} said the company is killing {e.them}.",
                    f"{e.They} said {e.theyre} fed up with the management.",
                    f"{e.They} said {e.they} can't stand some of {e.their} coworkers.",
                ]
            )
        return Quitting(
            employee=employee, reason=reason, worked_whole_day=worked_whole_day
        )


@dataclass
class Argument(Event):
    emp1: Employee
    emp2: Employee

    def print(self):
        print(f"{self.emp1} and {self.emp2} got into a big argument.")

    def apply(self, company: Company):
        pass

    @staticmethod
    def generate(company: Company) -> Event:
        emp1 = random.choice(list(company.scheduled_today))
        emp2 = random.choice(list(company.scheduled_today - {emp1}))
        return Argument(emp1=emp1, emp2=emp2)


@dataclass
class Gossip(Event):
    gossip: Employee
    subject: Employee
    dirt: str

    def print(self):
        print(
            f"{self.gossip} gossips about {self.subject}. {self.gossip.They} {self.dirt}."
        )

    def apply(self, company: Company):
        self.gossip.disposition_toward_company -= 0.1

    @staticmethod
    def generate(company: Company) -> Event:
        gossip = random.choice(list(company.scheduled_today))
        subject = random.choice(list(company.employees - {gossip}))
        dirt = random.choice(
            [
                f"said {subject.first_name} is lazy",
                f"thought {subject.first_name} is a kiss-up",
                f"thought {subject.first_name} talks about {gossip.them} behind {gossip.their} back",
                f"said {subject.first_name} is a know-it-all",
                f"can't stand {subject.first_name}",
            ]
        )
        return Gossip(gossip=gossip, subject=subject, dirt=dirt)


@dataclass
class Injury(Event):
    employee: Employee
    severe: bool
    days_off: int = 0

    def __post_init__(self):
        if self.severe:
            self.days_off = random.randint(7, 14)

    def print(self):
        if self.severe:
            print(
                f"{self.employee} was seriously injured and won't be back for at least {self.days_off} days."
            )
        else:
            print(
                f"{self.employee} was injured on the job and had to leave early. Nothing serious though."
            )

    def apply(self, company: Company):
        if self.severe:
            company.scheduled_today.remove(self.employee)
            company.days_till_next_scheduled[self.employee] = self.days_off
            if self.employee.disposition_toward_company > 0.85:
                self.employee.disposition_toward_company -= 0.15
            elif self.employee.disposition_toward_company > 0.1:
                self.employee.disposition_toward_company *= 0.5
            elif -0.1 < self.employee.disposition_toward_company < 0.1:
                self.employee.disposition_toward_company -= random.uniform(0.1, 0.5)
            else:
                self.employee.disposition_toward_company = -1.0
        else:
            company.scheduled_today.remove(self.employee)
            company.weekly_hours_worked[self.employee] -= random.randint(2, 6)
            if self.employee.disposition_toward_company > 0.85:
                self.employee.disposition_toward_company -= 0.05
            elif self.employee.disposition_toward_company > 0.1:
                self.employee.disposition_toward_company *= 0.9
            elif -0.5 < self.employee.disposition_toward_company < 0.1:
                self.employee.disposition_toward_company -= random.uniform(0.05, 0.1)
            else:
                self.employee.disposition_toward_company = -1.0

    @staticmethod
    def generate(company: Company) -> Event:
        employee = random.choice(list(company.scheduled_today))
        severe = random.random() < 0.3
        return Injury(employee=employee, severe=severe)


if __name__ == "__main__":
    main()
