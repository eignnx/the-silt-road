import { Person, Trait } from './person';
import { DefaultMap, randChoice, randNormal, randSample } from '../utils'; // Assuming you have a utility function for normal distribution

export const SKILLS = [
    "Teamster",
    "Laborer",
    "Security",
    "Accounting",
] as const;

export type Skill = typeof SKILLS[number];

export class Employee extends Person {
    skills: Set<Skill>;
    hourlyWage: number;
    moral: number;
    relationships: DefaultMap<Employee, number>;

    constructor(
        firstName: string,
        lastName: string,
        age: number,
        traits: Set<Trait>,
        skills: Set<Skill>,
        hourlyWage: number,
        moral: number,
        relationships: DefaultMap<Employee, number> = new DefaultMap(() => 0),
    ) {
        super(firstName, lastName, age, traits);
        this.skills = skills;
        this.hourlyWage = hourlyWage;
        this.moral = moral;
        this.relationships = relationships;
    }

    static generate(): Employee {
        const person = Person.generate();
        const skills = new Set(randSample(
            Math.round(randNormal(1, 0.6, [1, SKILLS.length])),
            SKILLS,
        ));
        const hourlyWage = randNormal(0.17, 0.03, [0.01, 0.75]);
        const moral = randNormal(0.5, 0.1, [-1, 1]);
        return new Employee(
            person.firstName,
            person.lastName,
            person.age,
            person.traits,
            skills,
            hourlyWage,
            moral,
        );
    }

    likes(other: Employee): boolean {
        return this.relationships.get(other) > 0.5;
    }

    dislikes(other: Employee): boolean {
        return this.relationships.get(other) < 0.0;
    }

    hates(other: Employee): boolean {
        return this.relationships.get(other) < -0.8;
    }

    poorMoral(): boolean {
        return this.moral < -0.5;
    }

    goodMoral(): boolean {
        return this.moral > 0.25;
    }

    uneventfulDay(): string {
        if (this.goodMoral()) {
            return randChoice(["Another day, another dime.", "Just another day."]);
        } else if (this.poorMoral()) {
            return randChoice([
                "I gotta get the hell out of this job.",
                "Each day's worse than the last. See you tomorrow.",
                "Oh, yup, another day in paradise.",
            ]);
        } else {
            return randChoice([
                "Today was same as yesterday.",
                "What can I say. Just another day.",
                "Another day another dime. See you tomorrow.",
                "See you at the saloon?",
                "Today coulda' been a whole lot worse.",
            ]);
        }
    }
}