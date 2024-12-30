import { makeAutoObservable } from "mobx";

export class AutomationConfig {
    constructor() {
        makeAutoObservable(this);
    }

    __autoMining: boolean | undefined = undefined;
    get autoPaly() {
        return window.__env?.autoSetting?.autoPlay;
    }

    get autoMining() {
        if (this.__autoMining != undefined) {
            return this.__autoMining;
        }
        return window.__env?.autoSetting?.autoMining;
    }
    get autoLogin() {
        return window.__env?.autoSetting?.autoLogin;
    }

    setAutoMining(autoMining: boolean) {
        this.__autoMining = autoMining;
    }

    configDate: Date = new Date();

    hasAllowAiningTypeList(name: string) {
        // Mining Tournament
        // return ["Speed"];
        // return ["Speed"].find((item) =>
        //     name?.toLocaleLowerCase().includes(item?.toLocaleLowerCase())
        // );
        return true;
    }
}

//自动化打牌策略执行配置类
export class AutomationPlayConfig {
    constructor() {}

    //打牌策略枚举
    playStrategy: EnumPlayStrategy = EnumPlayStrategy.Aggressive;

    //更新打牌策略、根据当前排名、筹码量、以及盲注等条件来更新打牌策略
    updatePlayStrategy() {}
}

//打牌策略枚举类
export enum EnumPlayStrategy {
    //激进
    Aggressive = 1,
    //稳健
    Stable = 2,
    //保守
    Cautious = 3,
    //暂停操作
    Pause = 4,
}

//根据打牌策略枚举类，获取对应的牌型胜率配置
export function getWinRateConfigByPlayStrategy(playStrategy: EnumPlayStrategy) {
    switch (playStrategy) {
        case EnumPlayStrategy.Aggressive:
            return {
                winProbability: 0.5,
            };
        case EnumPlayStrategy.Stable:
            return {
                winProbability: 0.62,
            };
        case EnumPlayStrategy.Cautious:
            return {
                winProbability: 0.7,
            };
        case EnumPlayStrategy.Pause:
            return {
                winProbability: 1,
            };
    }
}

export const automationConfig = new AutomationConfig();
