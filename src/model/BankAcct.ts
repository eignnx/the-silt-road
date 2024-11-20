const RESOURCE_KEY = `SILT_ROAD:bank`;

type Bank = {
    [owner: string]: number;
};

export const PLAYER_ACCT: string = `$PLAYER`;
const DEFAULT_PLAYER_BALANCE: number = 7.25;

const DEFAULT_BANK: Bank = {
    [PLAYER_ACCT]: DEFAULT_PLAYER_BALANCE,
};

async function getBank(): Promise<Bank> {
    const fetched = localStorage.getItem(RESOURCE_KEY);
    return JSON.parse(fetched ?? JSON.stringify(DEFAULT_BANK));
}

async function replaceBank(newBank: Bank): Promise<Bank> {
    localStorage.setItem(RESOURCE_KEY, JSON.stringify(newBank));
    return newBank;
}


export const BANK = {
    SINK: "$SINK",
    SOURCE: "$SOURCE",

    async getAcctBalance(accountName: string): Promise<number> {
        if (accountName === this.SINK || accountName === this.SOURCE)
            throw new Error(`Cannot get balance of ${accountName}`);

        const bank = await getBank();
        if (accountName in bank) {
            return bank[accountName];
        } else {
            throw new Error(`Bank account for '${accountName}' does not exist`);
        }
    },

    async setAcctBalance(accountName: string, newBalance: number): Promise<number> {
        if (accountName === this.SINK) return newBalance;
        if (accountName === this.SOURCE) throw new Error(`Cannot set balance of ${accountName}`);

        const bank = await getBank();
        bank[accountName] = newBalance;
        await replaceBank(bank);
        return newBalance;
    },

    async withdraw(accountName: string, amount: number): Promise<number> {
        if (accountName === this.SOURCE) return amount;

        const balance = await this.getAcctBalance(accountName);
        if (balance >= amount) {
            return await this.setAcctBalance(accountName, balance - amount);
        } else {
            throw new Error("INSUFFICIENT FUNDS");
        }
    },

    async deposit(accountName: string, amount: number): Promise<number> {
        if (accountName === this.SINK) return amount;
        if (accountName === this.SOURCE) throw new Error(`You probably shouldn't be depositing into ${accountName}`);

        if (amount < 0) throw new Error(`Cannot deposit negative amount ${amount} into account '${accountName}'`);
        const balance = await this.getAcctBalance(accountName);
        return await this.setAcctBalance(accountName, balance + amount);
    },

    /**
     * 
     * @param srcAccount 
     * @param dstAccount 
     * @param amount 
     * @throws Error("INSUFFICIENT FUNDS")
     */
    async transfer(srcAccount: string, dstAccount: string, amount: number) {
        await this.withdraw(srcAccount, amount);
        await this.deposit(dstAccount, amount);
    }
};
