export interface ITaskConfig {
    windowList: Array<IWindowState>;
}

export interface IAccountInfo {
    account: string;
    password: string;
    index: number;
    userAgent: string;
    kyc: string;
}

export interface IWindowState {
    isOpen: boolean;
    account: IAccountInfo;
    browser: IBrowserConfig;
    autoSetting: IAutoSetting;
    groupName: string;
}

export interface IAutoSetting {
    autoLogin: boolean;
    autoKyc: boolean;
    autoPlay: boolean;
    autoMining: boolean;
}

export interface IBrowserConfig {
    userAgent: {
        pc: string;
        mobile: string;
    };
    lastHrefUrl: string;
    proxy?: {
        ip: string;
        port: number;
        type: string;
        username: string;
        password: string;
        getProxyUrl?: () => string;
    };
}
