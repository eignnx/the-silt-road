import { randInt, randFloat } from '../utils';

enum Trait {
    Masc = "masculine",
    Femm = "feminine",
    VisQueer = "visibly queer",
    Gay = "gay",
    Old = "old",
    Young = "young"
}

class Person {
    firstName: string;
    lastName: string;
    age: number;
    traits: Set<Trait>;
    nickname?: string;

    constructor(firstName: string,
        lastName: string, age: number, traits: Set<Trait>, nickname?: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.traits = traits;
        this.nickname = nickname;
    }

    static generate(minAge: number = 16, maxAge: number = 80): Person {
        const traits = new Set<Trait>();

        const g = randFloat(-1, 1);
        if (-0.1 < g && g < 0.1) {
            traits.add(Trait.VisQueer);
        } else if (g < 0) {
            traits.add(Trait.Masc);
        } else {
            traits.add(Trait.Femm);
        }

        const q = randFloat(0, 1);
        if (q > 0.9) {
            traits.add(Trait.VisQueer);
        }

        if ((traits.has(Trait.Femm) || traits.has(Trait.Masc)) && traits.has(Trait.VisQueer)) {
            traits.add(Trait.Gay);
        }

        const age = randInt(minAge, maxAge);

        if (age > 55) {
            traits.add(Trait.Old);
        }

        if (age < 25) {
            traits.add(Trait.Young);
        }

        let firstName: string;
        if (traits.has(Trait.Femm)) {
            firstName = randChoice(FEMININE_NAMES);
        } else if (traits.has(Trait.Masc)) {
            firstName = randChoice(MASCULINE_NAMES);
        } else {
            firstName = randChoice(NEUTRAL_NAMES);
        }

        const lastName = randChoice(LAST_NAMES);

        return new Person(firstName, lastName, age, traits);
    }

    static giveDistinguishingNicknames(people: Person[], usedNamesAndNicknames: Set<string>): void {
        people.forEach(p => {
            if (p.nickname) {
                usedNamesAndNicknames.add(p.nickname);
            }
        });

        people.forEach(p => {
            if (p.nickname) return;

            const nameBased = NAME_BASED_NICKNAMES[p.firstName];
            if (nameBased) {
                const available = nameBased.filter(n => !usedNamesAndNicknames.has(n));
                if (available.length > 0) {
                    p.nickname = randChoice(available);
                    usedNamesAndNicknames.add(p.nickname);
                    return;
                }
            }

            let nickname = randChoice(NICKNAMES);
            while (usedNamesAndNicknames.has(nickname)) {
                nickname = randChoice(NICKNAMES);
            }

            p.nickname = nickname;
            usedNamesAndNicknames.add(nickname);
        });
    }

    fullName(): string {
        if (this.nickname) {
            return `${this.firstName} '${this.nickname}' ${this.lastName}`;
        } else {
            return `${this.firstName} ${this.lastName}`;
        }
    }

    toString(): string {
        return this.nickname || this.firstName;
    }

    isMasc(): boolean {
        return this.traits.has(Trait.Masc);
    }

    isFem(): boolean {
        return this.traits.has(Trait.Femm);
    }

    sexDescriptor(): string {
        if (this.isFem()) {
            return "F";
        } else if (this.isMasc()) {
            return "M";
        } else {
            return "?";
        }
    }

    isQueer(): boolean {
        return this.traits.has(Trait.VisQueer);
    }

    isOld(): boolean {
        return this.traits.has(Trait.Old);
    }

    isYoung(): boolean {
        return this.traits.has(Trait.Young);
    }

    get they(): string {
        if (this.isMasc()) {
            return "he";
        } else if (this.isFem()) {
            return "she";
        } else {
            return "they";
        }
    }

    get They(): string {
        return this.they.charAt(0).toUpperCase() + this.they.slice(1);
    }

    get them(): string {
        if (this.isMasc()) {
            return "him";
        } else if (this.isFem()) {
            return "her";
        } else {
            return "them";
        }
    }

    get Them(): string {
        return this.them.charAt(0).toUpperCase() + this.them.slice(1);
    }

    get their(): string {
        if (this.isMasc()) {
            return "his";
        } else if (this.isFem()) {
            return "her";
        } else {
            return "their";
        }
    }

    get Their(): string {
        return this.their.charAt(0).toUpperCase() + this.their.slice(1);
    }

    get theyre(): string {
        if (this.isMasc()) {
            return "he's";
        } else if (this.isFem()) {
            return "she's";
        } else {
            return "they're";
        }
    }

    get Theyre(): string {
        return this.theyre.charAt(0).toUpperCase() + this.theyre.slice(1);
    }
}

const NEUTRAL_NAMES = [
    "Ace", "Axel", "Babe", "Bigs", "Biscuit", "Bloomer",
    "Calamity", "Cassidy", "CJ", "Dakota", "Danny", "Dig", "Doc",
    "Dogwood", "Dusty", "Greenie", "Jasper", "Jesse", "Kid",
    "Lucky", "Mack", "Maverick", "Mick", "Pennyless", "Pig-iron",
    "PJ", "Rev", "RJ", "Sasquatch", "Sawhorse", "Slippers",
    "Smokey", "Squid", "Sundance", "Sunny", "Tex", "Toad",
    "Turpentine", "Virgil", "Wally", "Yorkshire", "Zane", "Zero"
];

const FEMININE_NAMES = [
    "Abigail", "Ada", "Agnes", "Alice", "Annie", "Beau", "Bessie",
    "Betty", "Birdie", "Blanche", "Bonnie", "Belle", "Cheyenne",
    "Charlotte", "Cleo", "Clara", "Clementine", "Daisy", "Dolly",
    "Dusty", "Eleanor", "Eliza", "Ermengarde", "Etta", "Fanny",
    "Gillian", "Greta", "Hannah", "Harriet", "Hattie", "Hilde",
    "Hildegarde", "Jesse", "Lillie", "Mabel", "Mae", "Millie",
    "Minnie", "Nettie", "Nora", "Olive", "Pearl", "Sadie", "Sally",
    "Tess", "Tillie", "Violet", "Willa", "Willamina"
];

const MASCULINE_NAMES = [
    "Amos", "Barny", "Ben", "Bert", "Bill", "Billy", "Buck", "Butch",
    "Clint", "Clyde", "Cornilius", "Earl", "Eleazar", "Eli", "Emmett",
    "Ezra", "Floyd", "Frank", "Fred", "Gus", "Glenn", "Gill", "Hank",
    "Hezekiah", "Ike", "Isaac", "Jack", "Jeb", "Jed", "Jethro", "Jim",
    "Joe", "John", "James", "Jesse", "Obediah", "Otis", "Ringo",
    "Robert", "Rufus", "Silas", "Tex", "Utah", "Wade", "Wes",
    "William", "Wyatt", "Zeke"
];

const NICKNAMES = [
    "Sarge", "Trixie", "Teddy", "Fanny", "Smiley", "Squid", "Yank",
    "Wendy", "Pops", "Hopper", "Willy",
    ...NEUTRAL_NAMES
];

const NAME_BASED_NICKNAMES: { [name: string]: string[]; } = {
    "Hildegarde": ["Hilde"],
    "Ermengarde": ["Erma"],
    "Eleazar": ["Eli"],
    "William": ["Bill", "Billy", "Will", "Willy"],
    "James": ["Jim"],
    "Robert": ["Bob", "Bobby"],
    "Willamena": ["Willa", "Willie", "Mena"],
    "Sundance": ["Sunny"],
    "Clementine": ["Cleo", "Tina"],
    "Cornilius": ["Nellie"],
    "Gillian": ["Jill", "Gilly"],
    "Turpentine": ["Turp", "Tina", "Tinny"],
    "Virgil": ["Viggy", "Vicky"],
    "Elenor": ["Ellie", "Nellie"],
    "Calamity": ["Callie"],
    "Sasquatch": ["Sassy", "Sass"],
};

const LAST_NAMES = [
    "Baker", "Black", "Brown", "Carter", "Clark", "Cole", "Collins",
    "Cook", "Cooper", "Davis", "Diaz", "Evans", "Fisher", "Flores",
    "Foster", "Garcia", "Gonzalez", "Gray", "Green", "Hall", "Harris",
    "Hernandez", "Hill", "Howard", "Hughes", "Jackson", "James",
    "Jenkins", "Johnson", "Jones", "King", "Lee", "Lewis", "Long",
    "Lopez", "Martin", "Martinez", "Miller", "Mitchell", "Moore",
    "Morris", "Murphy", "Nelson", "Parker", "Perez", "Perry",
    "Peterson", "Phillips", "Powell", "Price", "Ramirez", "Reed",
    "Reyes", "Reynolds", "Richardson", "Rivera", "Roberts",
    "Robinson", "Rodriguez", "Rogers", "Ross", "Russell", "Sanchez",
    "Sanders", "Scott", "Simmons", "Smith", "Stewart", "Taylor",
    "Thomas", "Thompson", "Torres", "Turner", "Walker", "Ward",
    "Watson", "White", "Williams", "Wilson", "Wood", "Wright", "Young"
];

function randChoice<T>(arr: T[]): T {
    return arr[randInt(0, arr.length)];
}

export { Person, Trait };