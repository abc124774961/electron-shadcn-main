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

contextBridge.exposeInMainWorld("web3", {
    reload: (id: string) => {
        ipcRenderer.invoke("web3:reload", id);
        // alert(window.__env);
    },
    setIsAllowCamera: (allow: boolean, id: string) => {
        console.log("setIsAllowCamera", allow, id);
        // alert(allow)
        ipcRenderer.invoke("web3:setIsAllowCamera", allow, id);
    },
    setWindowIsOpen: (open: boolean, id: string) => {
        console.log("setIsAllowCamera", open, id);
        // alert(allow)
        ipcRenderer.invoke("web3:setWindowIsOpen", open, id);
    },
    setLayoutColumnMaxNumber: (column: number, id: string) => {
        console.log("setLayoutColumnMaxNumber", column, id);
        // alert(allow)
        ipcRenderer.invoke("web3:setLayoutColumnMaxNumber", column, id);
    },
});
