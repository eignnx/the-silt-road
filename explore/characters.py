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

        menu(c)

        events = random.choices(Event.__subclasses__(), k=random.randint(0, 3))
        for event_kind in events:
            e = event_kind.generate(c)
            e.print()
            e.apply(c)
            c.event_history[-1].append(e)
            confirm()

        if len(events) == 0:
            print(
                random.choice(
                    [
                        "The day went by smoothly.",
                        "The day was uneventful.",
                        "Nothing out of the ordinary happened today.",
                    ]
                )
            )
            confirm()

        total_labor_hours = c.end_of_day()
        print()
        print(f"Today's productivity: {total_labor_hours} labor hours")

        menu(c)

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
            print(f"{'Totals':<30} | {total_labor_hours:>3} | ${total:3.2f}")

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


def menu(c: "Company"):
    while True:
        print()
        print("OPTIONS")
        print("-------")
        print("    [D]ebug <NAME> - Print debug info for a person")
        print("    [T]alk <NAME> - Talk to an employee about recent events")
        print("    [L]isten - Listen to the latest gossip")
        print("    [H]iring - Go to hiring menu")
        print("    [E]mployees - List current employees")
        print("    [ENTER] - Continue")
        match input("> ").split(" "):
            case [] | [""]:
                break
            case ["h" | "H" | "hiring"]:
                hiring_menu(c)
            case ["t" | "T" | "talk", name]:
                talk_menu(c, name)
            case ["l" | "L" | "listen"]:
                listen_menu(c)
            case ["d" | "D" | "debug", name]:
                for employee in c.employees:
                    if (
                        (employee.nickname or "").lower() == name.lower()
                        or employee.first_name.lower() == name.lower()
                        or employee.last_name.lower() == name.lower()
                    ):
                        print(repr(employee))
                        break
                else:
                    print("Employee not found.")
            case ["e" | "E" | "employees"]:
                print()
                print("CURRENT EMPLOYEES")
                for employee in c.employees:
                    bullet = (
                        "*"
                        if employee in c.scheduled_today
                        else "x" if c.cant_be_scheduled_for_days[employee] > 0 else "-"
                    )
                    days_till = (
                        f"(Out for {c.cant_be_scheduled_for_days[employee]} days)"
                        if c.cant_be_scheduled_for_days[employee] > 0
                        else ""
                    )
                    print(f"\t{bullet} {employee.full_name():<30}{days_till}")
                print("* Scheduled today")
                print("x Can't be scheduled for a few days")
            case _:
                print("Invalid command.")


def hiring_menu(c: "Company"):
    pool = [Employee.generate() for _ in range(5)]
    print("HIRING")
    print("------")

    while True:
        for i, employee in enumerate(pool):
            print(f"{i + 1}. {employee.full_name()}")
            print(f"    - Age: {employee.age}")
        print()
        inp = input("> ")
        try:
            idx = int(inp) - 1
            if 0 <= idx < len(pool):
                c.hire(pool[idx])
                print(f"{pool[idx].full_name()} was hired.")
                break
            else:
                print("Invalid index.")
        except ValueError:
            match inp.lower():
                case "exit" | "quit" | "q":
                    break
                case _:
                    print("Invalid input.")
                    continue


def talk_menu(c: "Company", name: str):
    e = None
    for employee in c.employees:
        if (
            (employee.nickname or "").lower() == name.lower()
            or employee.first_name.lower() == name.lower()
            or employee.last_name.lower() == name.lower()
        ):
            e = employee
            break
    else:
        print("Employee not found.")
        return

    print()
    print(f"TALKING TO {e}")
    print("-------------------------------")
    try:
        event = random.choice(c.event_history[-1])
        dummy = Employee.generate()
        print(event.described_by_to(e, dummy))
    except IndexError:
        e.print_uneventful_day()


def listen_menu(c: "Company"):
    [e1, e2] = random.sample(list(c.employees), 2)
    try:
        event = random.choice(c.event_history[-1])
        d1 = event.described_by_to(e1, e2)
        d2 = event.described_by_to(e2, e1)
        if d1 != d2:
            print()
            print(f"{e1}: {d1}")
            print()
            print(f"{e2}: {d2}")
        else:
            print()
            print(f"{e1}: {d1}")

    except IndexError:
        print()
        print(f"{e1}: ", end="")
        e1.print_uneventful_day()
        print(f"{e2}: ", end="")
        e2.print_uneventful_day()


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
    relationships: defaultdict["Employee", float] = field(
        default_factory=lambda: defaultdict(float)
    )

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, value: "Employee"):
        return super().__eq__(value)

    def __repr__(self):
        relationships = {str(k): v for k, v in self.relationships.items()}
        return f'Employee("{self.full_name()}", age={self.age}, disposition_toward_company={self.disposition_toward_company:2.1f}, traits={self.traits}, relationships={relationships})'

    @staticmethod
    def generate():
        p = Person.generate()
        e = Employee(disposition_toward_company=random.uniform(0.5, 1.0), **p.__dict__)
        return e

    def likes(self, other: "Employee") -> bool:
        return self.relationships[other] > 0.5

    def dislikes(self, other: "Employee") -> bool:
        return self.relationships[other] < -0.1

    def hates(self, other: "Employee") -> bool:
        return self.relationships[other] < -0.8

    def print_uneventful_day(self):
        if self.disposition_toward_company > 0.8:
            print(
                random.choice(["'Another day, another dime.'", "'Just another day.'"])
            )
        elif self.disposition_toward_company < -0.8:
            print(
                random.choice(
                    [
                        "'I gotta get the hell out of this job.'",
                        "'Each day's worse than the last. See you tomorrow.'",
                        "'Oh, yup, another day in paradise.'",
                    ]
                )
            )
        else:
            print(
                random.choice(
                    [
                        "'Today was same as yesterday.'",
                        "'What can I say. Just another day.'",
                        "'Another day another dime. See you tomorrow.'",
                        "'See you at the saloon?'",
                        "'Today coulda been a whole lot worse.'",
                    ]
                )
            )


@dataclass
class Company:
    employees: set[Employee]
    scheduled_today: set[Employee]
    cant_be_scheduled_for_days: defaultdict[Employee, int]
    days_worked_per_week: dict[Employee, int]
    event_history: list[list["Event"]] = field(default_factory=list)

    weekly_hours_worked: defaultdict[Employee, int] = field(
        default_factory=lambda: defaultdict(int)
    )
    day_of_week: int = 0
    min_shift_size: int = 5
    max_shift_size: int = 10
    hourly_wage: float = 1.35 / 8  # $1.35 per hour (1860s dollars)
    daily_punchcard: defaultdict[Employee, int] = field(
        default_factory=lambda: defaultdict(int)
    )

    @staticmethod
    def generate() -> "Company":
        c = Company(
            employees=set(),
            scheduled_today=set(),
            cant_be_scheduled_for_days=defaultdict(int),
            days_worked_per_week={},
        )

        n_emps = random.randint(5, 15)
        for _ in range(n_emps):
            c.hire(Employee.generate())

        c.days_worked_per_week = {
            employee: random.randint(1, 6) for employee in c.employees
        }

        c.cant_be_scheduled_for_days = defaultdict(
            int, {employee: random.randint(0, 2) for employee in c.employees}
        )

        c.scheduled_today = set(
            employee
            for employee, days_till_scheduled in c.cant_be_scheduled_for_days.items()
            if days_till_scheduled == 0
        )

        return c

    def hire(self, e: Employee):
        same_name = [o for o in self.employees if o.first_name == e.first_name]
        if same_name:
            Person.give_distinguishing_nicknames(
                [e, *same_name], set(o.nickname for o in self.employees)
            )

        self.employees.add(e)

    def start_of_day(self):
        self.event_history.append([])
        self.create_todays_schedule()
        self.daily_punchcard = defaultdict(int)

    def end_of_day(self) -> int:
        self.day_of_week += 1
        self.day_of_week %= 7

        total_labor_hours = 0

        for employee in self.scheduled_today:
            self.days_worked_per_week[employee] += 1
            self.daily_punchcard[employee] += 8
            self.weekly_hours_worked[employee] += self.daily_punchcard[employee]
            total_labor_hours += self.daily_punchcard[employee]

        for employee, days_till_scheduled in self.cant_be_scheduled_for_days.items():
            if days_till_scheduled > 0:
                self.cant_be_scheduled_for_days[employee] -= 1

        return total_labor_hours

    def create_todays_schedule(self):
        while len(self.scheduled_today) < self.min_shift_size:
            no_emp_added = True

            for employee in self.employees:
                if employee in self.scheduled_today:
                    continue

                # Conditions for being put on the schedule:
                # 1. Haven't gone over their weekly hours.
                # 2. Aren't out for a few days.

                over_weekly_hours = (
                    self.weekly_hours_worked[employee]
                    >= self.days_worked_per_week[employee] * 8
                )
                out_for_a_bit = self.cant_be_scheduled_for_days[employee] > 0

                if not over_weekly_hours and not out_for_a_bit:

                    # Prioritize employees who need the hours the most.
                    days_left_in_week = 7 - self.day_of_week

                    if self.days_worked_per_week[employee] >= days_left_in_week:
                        self.scheduled_today.add(employee)  # Definitely add them.
                        no_emp_added = False
                    elif random.random() < 0.5:
                        self.scheduled_today.add(employee)
                        no_emp_added = False
                    else:
                        continue

            if no_emp_added:
                print()
                print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                print("Understaffed!")
                print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                print()
                break

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

    @abstractmethod
    def described_by_to(self, speaker: Employee, listener: Employee) -> str:
        pass


@dataclass
class CallOut(Event):
    employee: Employee

    def print(self):
        print(f"{self.employee} called out. {self.employee.They} didn't give a reason.")

    def apply(self, company: Company):
        company.scheduled_today.remove(self.employee)

    @staticmethod
    def generate(company: Company) -> Event:
        if random.random() < 1 / (1 + len(CallOut.__subclasses__())):
            return CallOut(employee=random.choice(list(company.scheduled_today)))
        else:
            event = random.choice(CallOut.__subclasses__())
            return event.generate(company)

    def described_by_to(self, speaker, listener):
        if speaker == self.employee:
            if speaker.likes(listener):
                return f"'Sorry {listener}, I can't talk about it.'"
            elif speaker.hates(listener):
                return f"'None of your concern, {listener}.'"
            else:
                return "'I'd prefer not to talk about it.'"
        elif listener == self.employee:
            if speaker.likes(listener):
                return "'You called out, but I'm sure you had your reasons.'"
            elif listener.dislikes(speaker):
                return "'You really owe us an apology for leaving us short-handed.'"
            else:
                return "'I stay out of your business, you stay out of mine.'"
        else:
            if speaker.likes(self.employee):
                return f"'Yeah {self.employee} called out. I hope everything's okay.'"
            elif speaker.dislikes(self.employee):
                return f"'{self.employee} called out. Again.'"
            else:
                return f"'{self.employee} called out. Who knows why though, right?'"


@dataclass
class CallOutSick(CallOut):
    out_for_days: int

    def print(self):
        e = self.employee
        if self.out_for_days == 0:
            print(f"{e} called out sick, but {e.They} should be back tomorrow.")
        else:
            print(
                f"{e} called out sick. {e.They} probably won't be back for {self.out_for_days} days."
            )

    def apply(self, company: Company):
        company.scheduled_today.remove(self.employee)
        company.cant_be_scheduled_for_days[self.employee] = self.out_for_days

    @staticmethod
    def generate(company: Company) -> Event:
        employee = random.choice(list(company.scheduled_today))
        return CallOutSick(employee=employee, out_for_days=random.randint(0, 3))

    def described_by_to(self, speaker, listener):
        if speaker == self.employee:
            if speaker.likes(listener):
                return "'I was not feeling well at all. I apologize if I put more work on y'all.'"
            elif speaker.hates(listener):
                return "'Now that I can't work you're interested in my health, is that it {listener}?'"
            else:
                return "'I had to rest up or I'd be no good to anyone.'"
        elif listener == self.employee:
            if speaker.likes(listener):
                return "'Glad to see you back on your feet. We missed you {listener}.'"
            elif listener.dislikes(speaker):
                return "'Looks like you really were sick! Good thing you're back, we've been busy.'"
            else:
                return (
                    "'Hey, as long as you're feeling better, that's all that matters.'"
                )
        else:
            if speaker.likes(self.employee):
                return f"'{self.employee} called out sick. I hope {self.theyre} feeling better.'"
            elif speaker.dislikes(self.employee):
                return f"'{self.employee} called out sick. Again.'"
            else:
                return (
                    f"'{self.employee} called out sick. Who knows why though, right?'"
                )


@dataclass
class CallOutRelativeSick(CallOut):
    relative: str

    @staticmethod
    def generate(company):
        return CallOutRelativeSick(
            employee=random.choice(list(company.scheduled_today)),
            relative=random_relative(),
        )

    def print(self):
        e = self.employee
        print(f"{e} called out. {e.They} said {e.their} {self.relative} is sick.")

    def apply(self, company):
        company.scheduled_today.remove(self.employee)

    def described_by_to(self, speaker: Employee, listener: Employee):
        if speaker == self.employee:
            if speaker.hates(listener):
                return f"'You wouldn't understand, {listener}. My {self.relative} is sick.'"
            else:
                return f"'My {self.relative} has gotten worse. Sorry for the inconvenience, but I had to be there.'"
        elif listener == self.employee:
            if listener.hates(speaker):
                return f"'Your {self.relative} sure gets sick a lot.'"
            else:
                return f"'I hope your {self.relative} is feeling better.'"
        else:
            if speaker.likes(self.employee):
                return f"'{self.employee} called out. {self.They} said {self.their} {self.relative} is sick.'"
            elif speaker.dislikes(self.employee):
                return f"'{self.employee} called out. Again.'"
            else:
                return f"'{self.employee} called out. Who knows why though, right?'"


@dataclass
class Quitting(Event):
    employee: Employee
    worked_whole_day: bool

    def print(self):
        raise NotImplementedError()

    def apply(self, company: Company):
        raise NotImplementedError()

    @staticmethod
    def generate(company: Company) -> Event:
        return random.choice(Quitting.__subclasses__()).generate(company)


@dataclass
class QuittingForBetterJob(Quitting):

    @staticmethod
    def generate(company):
        return QuittingForBetterJob(
            employee=random.choice(list(company.employees)), worked_whole_day=True
        )

    def print(self):
        e = self.employee
        print(f"Today was {e}'s last day. {e.They} said {e.they}'d found a better job.")

    def apply(self, company):
        company.employees.remove(self.employee)

    def described_by_to(self, speaker: Employee, listener: Employee):
        e = self.employee
        if speaker == self.employee:
            return "'I found a better job. Sorry, but I have to go.'"
        elif listener == self.employee:
            if speaker.likes(listener):
                return f"'I'm happy for you, {listener}. Good luck!'"
            elif speaker.dislikes(listener):
                return "'So glad to hear you're moving on to greener pastures!'"
            else:
                if speaker.disposition_toward_company > 0.0:
                    return "'I hope you find what you're looking for.'"
                else:
                    return "'Best of luck with the new job! Can't be any worse than this place...'"
        else:
            if speaker.likes(self.employee):
                return f"'Did you hear? {e}'s got a new job! What are we gonna do without {e.them}!'"
            elif speaker.dislikes(self.employee):
                return f"'{e}'s up and quit. Can't say I'm sorry to see {e.them} go...'"
            else:
                return f"'{e}'s gone. New job I think.'"


@dataclass
class QuittingDislikesCoworkers(Quitting):
    @staticmethod
    def generate(company):
        for emp1 in company.employees:
            for emp2 in company.employees:
                if emp1 == emp2:
                    continue
                if (
                    emp1.hates(emp2)
                    and emp2.dislikes(emp1)
                    and emp1.disposition_toward_company < 0
                ):
                    return QuittingDislikesCoworkers(
                        employee=emp1, worked_whole_day=False
                    )
        else:
            # Nobody hates each other enough to quit.
            return QuittingForBetterJob.generate(company)

    def print(self):
        e = self.employee
        mid_shift = (
            f"part-way through {e.their} shift" if not self.worked_whole_day else ""
        )
        print(
            f"{e} quit{mid_shift}. {e.They} said they can't stand some of {e.their} coworkers."
        )

    def apply(self, company):
        company.employees.remove(self.employee)
        if not self.worked_whole_day:
            company.daily_punchcard[self.employee] -= random.randint(2, 6)

    def described_by_to(self, speaker: Employee, listener: Employee):
        e = self.employee
        if speaker == e:
            return "'These people will stab you in the back as soon as you turn around. I'm out.'"
        elif listener == e:
            if speaker.likes(listener):
                return (
                    "'They've treated you like shit, you didn't deserve any of this.'"
                )
            elif speaker.hates(listener) and listener.hates(speaker):
                return "'Don't let the door hit you on your way out!'"
            elif listener.hates(speaker):
                return "'I suppose you think I'm the one driving you to leave?'"
            else:
                return (
                    "'I'm not taking sides. Hope your next job is more to your liking.'"
                )
        else:
            if speaker.dislikes(e):
                return f"'{e} thinks everyone's out to get {e.them}. Not sorry to see {e.them} go.'"
            elif speaker.likes(e):
                return f"'People here have treated {e} like shit. {e.They} didn't deserve any of this!'"
            else:
                return f"'{e} quit. {e.They} said there's too much drama here.'"


@dataclass
class QuittingForRelative(Quitting):
    relative: str

    @staticmethod
    def generate(company: Company):
        e = random.choice(list(company.employees))
        return QuittingForRelative(
            employee=e, worked_whole_day=True, relative=random_relative()
        )

    def apply(self, company):
        company.employees.remove(self.employee)

    def print(self):
        e = self.employee
        print(
            f"{e} quit. {e.They} said {e.their} {self.relative} requires more care now."
        )

    def described_by_to(self, speaker: Employee, listener: Employee):
        e = self.employee
        if speaker == e:
            return f"'My {self.relative} needs me more and more these days. I had to leave.'"
        elif listener == e:
            if speaker.likes(listener):
                return f"'I understand, {listener}. Family comes first.'"
            elif speaker.dislikes(listener):
                return f"'Your {self.relative} sure needs a lot of care, huh?'"
            else:
                return f"'I hope everything works out with your {self.relative}.'"
        else:
            if speaker.likes(e):
                return f"'{e} quit. {e.They} said {e.their} {self.relative} needs more care.'"
            elif speaker.dislikes(e):
                return f"'{e} quit. Always some excuse with {e.them}.'"
            else:
                return random.choice(
                    [
                        f"'{e} quit. Something about {e.their} {self.relative}.'",
                        f"'Anyone know what's going on with {e}? Did {e.they} quit?'",
                        f"'{e} quitting? Unfortunately I can't say I'm surprised. {e.Their} {self.relative} needs {e.them}.'",
                    ]
                )


@dataclass
class Argument(Event):
    emp1: Employee
    emp2: Employee

    def print(self):
        print(f"{self.emp1} and {self.emp2} got into a big argument.")

    def apply(self, company: Company):
        if self.emp1.likes(self.emp2) and self.emp2.likes(self.emp1):
            self.emp1.relationships[self.emp2] += 0.05
        else:
            self.emp1.disposition_toward_company -= 0.1
            self.emp2.disposition_toward_company -= 0.1
            self.emp1.relationships[self.emp2] -= 0.1
            self.emp2.relationships[self.emp1] -= 0.1

    @staticmethod
    def generate(company: Company) -> Event:
        emp1 = random.choice(list(company.scheduled_today))
        emp2 = random.choice(list(company.scheduled_today - {emp1}))
        return Argument(emp1=emp1, emp2=emp2)

    def described_by_to(self, speaker: Employee, listener: Employee):
        if speaker in {self.emp1, self.emp2} and listener in {self.emp1, self.emp2}:
            if speaker.likes(listener):
                return "'We had a disagreement, but it's all sorted out now.'"
            elif speaker.hates(listener):
                return "'You just had to have the last word, didn't you.'"
            else:
                [other] = list({self.emp1, self.emp2} - {speaker})
                return random.choice(
                    [
                        f"'I'm done with {other}. {other.Theyre} impossible.'",
                        f"'{other} just rubs me the wrong way. {other.they} better watch {other.their} mouth.'",
                        f"'I can't stand {other}! {other.Theyre} probably talking about me right now.'",
                    ]
                )
        elif listener in {self.emp1, self.emp2}:
            [other] = list({self.emp1, self.emp2} - {listener})
            if listener.likes(speaker):
                return f"'I'm glad you and {other} worked things out in the end.'"
            else:
                return "'I'm not getting involved in this. You two sort it out.'"

        elif speaker in {self.emp1, self.emp2}:
            [other] = list({self.emp1, self.emp2} - {speaker})
            if speaker.likes(other):
                return (
                    f"'{other} and I had a disagreement, but it's all sorted out now.'"
                )
            elif speaker.hates(other):
                return f"'{other} just had to have the last word, didn't {other.they}.'"
            else:
                return f"'I'm done with {other}. {other.Theyre} impossible!'"
        else:
            return random.choice(
                [
                    f"'I'm exhausted. {self.emp2} and {self.emp1} were at each other's throats today.'",
                    f"'You wouldn't believe the argument {self.emp2} and {self.emp1} had today. Is this grade school?'",
                    f"'{self.emp2} and {self.emp1} had a big argument today. I'm staying out of it.'",
                    f"'Arguments happen. I'm sure {self.emp1} and {self.emp2} will work it out.'",
                ]
            )


@dataclass
class Gossip(Event):
    gossip: Employee
    subject: Employee
    dirt: str

    def print(self):
        print(
            f"{self.gossip} was gossiping about {self.subject}. {self.gossip.They} {self.dirt}."
        )

    def apply(self, company: Company):
        self.gossip.disposition_toward_company -= 0.1
        self.gossip.relationships[self.subject] -= 0.1
        self.subject.disposition_toward_company -= 0.1

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

    def described_by_to(self, speaker: Employee, listener: Employee):
        if speaker == self.gossip:
            if speaker.likes(listener):
                return f"'Did you {self.subject}. {self.subject.They} {self.dirt}'"
        else:
            if speaker.likes(self.gossip):
                return f"'Did you hear? {self.gossip} was talking about {self.subject}. {self.gossip.They} {self.dirt}'"
            elif speaker.dislikes(self.gossip):
                return f"'{self.gossip} was gossiping about {self.subject}. {self.gossip.They} {self.dirt}'"
            else:
                return f"'{self.gossip} was gossiping about {self.subject}. {self.gossip.They} {self.dirt}'"


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
                f"{self.employee} was seriously injured part way through the shift and won't be back for at least {self.days_off} days."
            )
        else:
            print(
                f"{self.employee} was injured on the job and had to leave early. Nothing serious though."
            )

    def apply(self, company: Company):
        if self.severe:
            company.scheduled_today.remove(self.employee)
            company.cant_be_scheduled_for_days[self.employee] = self.days_off
            company.daily_punchcard[self.employee] -= random.randint(2, 6)
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
            company.daily_punchcard[self.employee] -= random.randint(2, 6)
            if self.employee.disposition_toward_company > 0.85:
                self.employee.disposition_toward_company -= 0.05
            elif self.employee.disposition_toward_company > 0.1:
                self.employee.disposition_toward_company *= 0.9
            elif -0.5 < self.employee.disposition_toward_company < 0.1:
                self.employee.disposition_toward_company -= random.uniform(0.05, 0.1)
            else:
                self.employee.disposition_toward_company = -1.0

        for e in company.employees:
            if e == self.employee:
                continue
            if e.hates(self.employee):
                e.disposition_toward_company += 0.1
            else:
                e.relationships[self.employee] += 0.1

    @staticmethod
    def generate(company: Company) -> Event:
        employee = random.choice(list(company.scheduled_today))
        severe = random.random() < 0.3
        return Injury(employee=employee, severe=severe)

    def described_by_to(self, speaker: Employee, listener: Employee):
        e = self.employee
        if speaker == self.employee:
            if self.severe:
                if self.employee.disposition_toward_company > 0.0:
                    return f"'I'm in a lot of pain. I won't be back for a while.'"
                else:
                    return random.choice(
                        [
                            f"'This damn company will ruin me!",
                            f"'This is the last straw. I'm putting in notice tomorrow.'",
                        ]
                    )
            else:
                if self.employee.disposition_toward_company > 0.0:
                    return f"'I'm fine. I'll be back tomorrow.'"
                else:
                    return random.choice(
                        [
                            f"'Look, it's not serious, but this place is a safety hazard.'",
                            f"'I'm fine. I'll be back in this hell-hole tomorrow.'",
                        ]
                    )
        elif listener == self.employee:
            if self.severe:
                return f"'I hope you feel better soon. Take care of yourself.'"
            else:
                return f"'You're always getting hurt. Take care of yourself.'"
        else:
            if self.severe:
                return random.choice(
                    [
                        f"'{e} got hurt bad. We're gonna be short-handed for a bit.'",
                        f"'If they'd serviced the equipment regularly as instructed, {e} might not have gotten hurt. It's a damn shame.'",
                        f"'{e} got hurt bad. I hope {e.theyre} okay.'",
                    ]
                )
            else:
                return random.choice(
                    [
                        f"'{e} got hurt. Again.'",
                        f"'{e} got hurt. I hope {e.theyre} okay.'",
                        f"'Maybe this'll teach {e} to be more careful.'",
                    ]
                )


if __name__ == "__main__":
    main()
