import { MakeStorage } from './storage-template';

export type PlayerInfo = {
    playerName: string;
    companyName: string;
};

const DEFAULT_PLAYER_INFO: PlayerInfo = {
    playerName: "Homer S. McCoy",
    companyName: "McCoy & Sons Conveyance Co.",
};

export const PLAYER_INFO = {
    ...MakeStorage({
        resourceKey: "playerInfo",
        seedValue: DEFAULT_PLAYER_INFO,
    }),

    async getPlayerName(): Promise<string> {
        const info = await this.get();
        return info.playerName;
    },

    async getCompanyName(): Promise<string> {
        const info = await this.get();
        return info.companyName;
    },
};