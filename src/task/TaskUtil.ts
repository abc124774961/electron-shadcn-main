import { ipcRenderer } from "electron/renderer";
import TaskConfig from "./TaskConfig";
import { makeObservable, observable } from "mobx";
import { ITaskConfig } from "@/types";

class TaskUtil {
    public constructor() {
        makeObservable(this);
    }
    initDataFromConfig(dataConfig: ITaskConfig): void {
        // 从配置文件中读取数据，并更新currentTaskConfig
        this.currentTaskConfig = new TaskConfig(dataConfig?.accountList ?? []);
    }

    iii = 0;

    @observable
    currentTaskConfig: TaskConfig | undefined;
    //setTaskConfig
    public async setTaskConfig(taskConfig: TaskConfig): Promise<void> {
        this.currentTaskConfig = taskConfig;
    }
}

export default new TaskUtil();
