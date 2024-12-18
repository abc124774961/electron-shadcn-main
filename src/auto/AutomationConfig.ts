export class AutomationConfig {
    get autoPaly() {
        return window.__env?.autoSetting?.autoPlay;
    }

    get autoMining() {
        return window.__env?.autoSetting?.autoMining;
    }
    get autoLogin() {
        return window.__env?.autoSetting?.autoLogin;
    }
}
