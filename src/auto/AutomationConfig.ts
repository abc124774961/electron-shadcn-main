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
}
