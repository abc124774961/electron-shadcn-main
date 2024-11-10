import { IAccountInfo, ITaskConfig } from "@/types";
import { makeObservable, observable } from "mobx";

class TaskConfig implements ITaskConfig {
    @observable
    accountList: Array<IAccountInfo>;
    constructor(accountList: Array<IAccountInfo>) {
        this.accountList = accountList;
        makeObservable(this);
    }
    static fromJson(json: string): TaskConfig {
        const data = JSON.parse(json);
        return new TaskConfig(data.accountList);
    }

    //根据isOpen返回账号列表
    getAccountListByIsOpen(isOpen: boolean = true): Array<IAccountInfo> {
        return this.accountList.filter((account) => account.isOpen === isOpen);
    }

    //根据Index获取accountInfo
}

export default TaskConfig;
