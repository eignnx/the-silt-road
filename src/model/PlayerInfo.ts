const RESOURCE_KEY = `SILT_ROAD:playerInfo`;

export type PlayerInfo = {
    playerName: string;
    companyName: string;
};

const DEFAULT_PLAYER_INFO: PlayerInfo = {
    playerName: "Homer S. McCoy",
    companyName: "McCoy & Sons Conveyance Co.",
};

export const PLAYER_INFO = {
    async getPlayerInfo(): Promise<PlayerInfo> {
        const retrieval = localStorage.getItem(RESOURCE_KEY);
        return JSON.parse(retrieval ?? JSON.stringify(DEFAULT_PLAYER_INFO));
    },

    async replacePlayerInfo(newInfo: PlayerInfo) {
        localStorage.setItem(RESOURCE_KEY, JSON.stringify(newInfo));
    },

    async getPlayerName(): Promise<string> {
        const info = await this.getPlayerInfo();
        return info.playerName;
    },

    async getCompanyName(): Promise<string> {
        const info = await this.getPlayerInfo();
        return info.companyName;
    },
};