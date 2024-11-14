import { contextBridge, ipcRenderer } from "electron";
import exposeContexts from "./helpers/ipc/context-exposer";
import TaskUtil from "./task/TaskUtil";
import TaskConfig from "./task/TaskConfig";
import { ITaskConfig } from "./types";

exposeContexts();

contextBridge.exposeInMainWorld("mtt", {
    user: {
        login: () => {
            ipcRenderer.invoke("user:login");
        },
    },
});

// 监听主进程发送的数据
ipcRenderer.on("taskConfig", (event, dataConfig: ITaskConfig) => {
    contextBridge.exposeInMainWorld("qeConfig", {
        dataConfig: () => {
            return dataConfig;
        },
    });
});

// 监听主进程发送的数据
ipcRenderer.on("url-change", (event) => {
    console.log("url-change");
    alert("url-change");
});
