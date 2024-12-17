from dataclasses import dataclass
from enum import Enum
import random
from typing import Collection, Iterator, Optional


@dataclass
class Person:
    first_name: str
    last_name: str

    age: int
    traits: set["Trait"]

    middle_initial: Optional[str] = None
    nickname: Optional[str] = None

    def __hash__(self):
        return hash((self.first_name, self.middle_initial, self.last_name))

    def __eq__(self, value: "Person"):
        return (
            self.first_name == value.first_name
            and self.middle_initial == value.middle_initial
            and self.last_name == value.last_name
        )

    def full_name(self) -> str:
        match (self.nickname, self.middle_initial):
            case (None, None):
                return f"{self.first_name} {self.last_name}"
            case (None, _):
                return f"{self.first_name} {self.middle_initial}. {self.last_name}"
            case (_, None):
                return f"{self.first_name} '{self.nickname}' {self.last_name}"
            case (_, _):
                return f"{self.first_name} '{self.nickname}' {self.middle_initial}. {self.last_name}"

    def __str__(self):
        if self.nickname:
            return self.nickname
        else:
            return self.first_name

    def is_masc(self) -> bool:
        return Trait.Masc in self.traits

    def is_fem(self) -> bool:
        return Trait.Femm in self.traits

    def sex_descriptor(self) -> str:
        if self.is_fem():
            return "F"
        elif self.is_masc():
            return "M"
        else:
            return "?"

    def is_queer(self) -> bool:
        return Trait.VisQueer in self.traits

    def is_old(self) -> bool:
        return Trait.Old in self.traits

    def is_young(self) -> bool:
        return Trait.Young in self.traits

    @staticmethod
    def generate(min_age: int = 16, max_age: int = 80) -> "Person":
        traits = set()

        g = random.uniform(-1, 1)
        if -0.1 < g < 0.1:
            traits.add(Trait.VisQueer)
        elif g < 0:
            traits.add(Trait.Masc)
        else:
            traits.add(Trait.Femm)

        q = random.uniform(0, 1)
        if q > 0.9:
            traits.add(Trait.VisQueer)

        if (Trait.Femm in traits or Trait.Masc in traits) and Trait.VisQueer in traits:
            traits.add(Trait.Gay)

        age = -1000
        while not (min_age <= age <= max_age):
            age = round(random.gauss(mu=35, sigma=(max_age - min_age) / 3))

        if age > 55:
            traits.add(Trait.Old)

        if age < 25:
            traits.add(Trait.Young)

        # Choose name
        if Trait.Femm in traits:
            first_name = FEMININE_NAMES
        elif Trait.Masc in traits:
            first_name = MASCULINE_NAMES
        else:
            first_name = NEUTRAL_NAMES

        first_name = random.choice(first_name)

        last_name = random.choice(LAST_NAMES)

        return Person(
            first_name=first_name, last_name=last_name, age=age, traits=traits
        )

    @staticmethod
    def give_distinguishing_nicknames(
        people: Collection["Person"], used_nicknames: set[str]
    ) -> None:
        used_nicknames.update({p.nickname for p in people if p.nickname is not None})
        for p in people:
            if p.nickname is not None:
                continue
            nickname = random.choice(NICKNAMES)
            while nickname in used_nicknames:
                nickname = random.choice(NICKNAMES)
            p.nickname = nickname
            used_nicknames.add(nickname)

    @property
    def they(self) -> str:
        if self.is_masc():
            return "he"
        elif self.is_fem():
            return "she"
        else:
            return "they"

    @property
    def They(self) -> str:
        return self.they.capitalize()

    @property
    def them(self) -> str:
        if self.is_masc():
            return "him"
        elif self.is_fem():
            return "her"
        else:
            return "them"

    @property
    def Them(self) -> str:
        return self.them.capitalize()

    @property
    def their(self) -> str:
        if self.is_masc():
            return "his"
        elif self.is_fem():
            return "her"
        else:
            return "their"

    @property
    def Their(self) -> str:
        return self.their.capitalize()

    @property
    def theyre(self) -> str:
        if self.is_masc():
            return "he's"
        elif self.is_fem():
            return "she's"
        else:
            return "they're"

    @property
    def Theyre(self) -> str:
        return self.theyre.capitalize()


class Trait(Enum):
    Masc = "masculine"
    Femm = "feminine"
    VisQueer = "visibly queer"
    Gay = "gay"
    Old = "old"
    Young = "young"

    def __str__(self):
        return self.value


NEUTRAL_NAMES = [
    "Ace",
    "Axel",
    "Babe",
    "Bigs",
    "Biscuit",
    "Bloomer",
    "Calamity",
    "Cassidy",
    "CJ",
    "Dakota",
    "Danny",
    "Dig",
    "Doc",
    "Dogwood",
    "Dusty",
    "Greenie",
    "Jasper",
    "Jesse",
    "Kid",
    "Lucky",
    "Mack",
    "Maverick",
    "Mick",
    "Pennyless",
    "Pig-iron",
    "PJ",
    "Rev",
    "RJ",
    "Sasquatch",
    "Sawhorse",
    "Slippers",
    "Smokey",
    "Squid",
    "Sundance",
    "Sunny",
    "Tex",
    "Toad",
    "Turpentine",
    "Virgil",
    "Wally",
    "Yorkshire",
    "Zane",
    "Zero",
]

FEMININE_NAMES = [
    "Abigail",
    "Ada",
    "Agnes",
    "Alice",
    "Annie",
    "Beau",
    "Bessie",
    "Betty",
    "Birdie",
    "Blanche",
    "Bonnie",
    "Belle",
    "Cheyenne",
    "Charlotte",
    "Cleo",
    "Clara",
    "Clementine",
    "Daisy",
    "Dolly",
    "Dusty",
    "Eleanor",
    "Eliza",
    "Ermengarde",
    "Etta",
    "Fanny",
    "Gillian",
    "Greta",
    "Hannah",
    "Harriet",
    "Hattie",
    "Hilde",
    "Hildegarde",
    "Jesse",
    "Lillie",
    "Mabel",
    "Mae",
    "Millie",
    "Minnie",
    "Nettie",
    "Nora",
    "Olive",
    "Pearl",
    "Sadie",
    "Sally",
    "Tess",
    "Tillie",
    "Violet",
    "Willa",
    "Willamina",
]

MASCULINE_NAMES = [
    "Amos",
    "Barny",
    "Ben",
    "Bert",
    "Bill",
    "Billy",
    "Buck",
    "Butch",
    "Clint",
    "Clyde",
    "Cornilius",
    "Earl",
    "Eleazar",
    "Eli",
    "Emmett",
    "Ezra",
    "Floyd",
    "Frank",
    "Fred",
    "Gus",
    "Glenn",
    "Gill",
    "Hank",
    "Hezekiah",
    "Ike",
    "Isaac",
    "Jack",
    "Jeb",
    "Jed",
    "Jethro",
    "Jim",
    "Joe",
    "John",
    "James",
    "Jesse",
    "Obediah",
    "Otis",
    "Ringo",
    "Robert",
    "Rufus",
    "Silas",
    "Tex",
    "Utah",
    "Wade",
    "Wes",
    "William",
    "Wyatt",
    "Zeke",
]

NICKNAMES = [
    "Sarge",
    "Trixie",
    "Teddy",
    "Fanny",
    "Smiley",
    "Squid",
    "Yank",
    "Wendy",
    "Pops",
    "Hopper",
    "Willy",
] + NEUTRAL_NAMES


MIDDLE_INITIALS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

LAST_NAMES = [
    "Baker",
    "Black",
    "Brown",
    "Carter",
    "Clark",
    "Cole",
    "Collins",
    "Cook",
    "Cooper",
    "Davis",
    "Diaz",
    "Evans",
    "Fisher",
    "Flores",
    "Foster",
    "Garcia",
    "Gonzalez",
    "Gray",
    "Green",
    "Hall",
    "Harris",
    "Hernandez",
    "Hill",
    "Howard",
    "Hughes",
    "Jackson",
    "James",
    "Jenkins",
    "Johnson",
    "Jones",
    "King",
    "Lee",
    "Lewis",
    "Long",
    "Lopez",
    "Martin",
    "Martinez",
    "Miller",
    "Mitchell",
    "Moore",
    "Morris",
    "Murphy",
    "Nelson",
    "Parker",
    "Perez",
    "Perry",
    "Peterson",
    "Phillips",
    "Powell",
    "Price",
    "Ramirez",
    "Reed",
    "Reyes",
    "Reynolds",
    "Richardson",
    "Rivera",
    "Roberts",
    "Robinson",
    "Rodriguez",
    "Rogers",
    "Ross",
    "Russell",
    "Sanchez",
    "Sanders",
    "Scott",
    "Simmons",
    "Smith",
    "Stewart",
    "Taylor",
    "Thomas",
    "Thompson",
    "Torres",
    "Turner",
    "Walker",
    "Ward",
    "Watson",
    "White",
    "Williams",
    "Wilson",
    "Wood",
    "Wright",
    "Young",
]

if __name__ == "__main__":
    for _ in range(10):
        p = Person.generate()
        print(p, p.age, p.traits)
