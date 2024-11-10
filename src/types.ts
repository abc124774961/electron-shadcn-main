export interface ITaskConfig {
    accountList: Array<IAccountInfo>;
}

export interface IAccountInfo {
    account: string;
    password: string;
    index: number;
    isOpen: boolean;
}
