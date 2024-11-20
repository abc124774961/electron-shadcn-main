import { IAccountInfo, ITaskConfig, IWindowState } from "@/types";
// import { makeObservable, observable } from "mobx";

class TaskConfig implements ITaskConfig {
    // @observable
    windowList: Array<IWindowState>;
    constructor(windowList: Array<IWindowState>) {
        this.windowList = windowList;
        // makeObservable(this);
        this.windowList.forEach((state) => {
            if (state.browser?.proxy) {
                const p = state.browser.proxy;
                state.browser.proxy.getProxyUrl = () => {
                    return `${p.type}://${p.username}:${p.password}@${p.ip}:${p.port}`;
                };
            }
        });
    }
    static fromJson(json: string): TaskConfig {
        const data = JSON.parse(json);
        return new TaskConfig(data.accountList);
    }

    //根据isOpen返回账号列表
    getWindowListByIsOpen(isOpen: boolean = true): Array<IWindowState> {
        return this.windowList.filter((win) => win.isOpen === isOpen && win.browser);
    }
    getWindowList(): Array<IWindowState> {
        return this.windowList.filter((win) => win.browser);
    }

    //根据Index获取accountInfo
}

export default TaskConfig;
