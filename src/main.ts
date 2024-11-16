import {
    BrowserWindow,
    app,
    ipcMain,
    IpcMainEvent,
    nativeTheme,
    WebContentsView,
    screen,
    View,
    contextBridge,
    ipcRenderer,
    session,
    desktopCapturer,
} from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
// "electron-squirrel-startup" seems broken when packaging with vite
//import started from "electron-squirrel-startup";
import path from "path";
import playwright, { ElectronApplication, _electron as electron } from "playwright";
// import playwrightCore from "playwright-core";
import fs from "fs";
import { IAccountInfo, ITaskConfig, IWindowState } from "./types";
import TaskConfig from "./task/TaskConfig";
import { BrowserView, getCurrentWebContents } from "@electron/remote";
import { sockProxyRules } from "electron-session-proxy";

const inDevelopment = process.env.NODE_ENV === "development";

let electronApp: ElectronApplication;
async function createWindow() {
    // await pie.initialize(app);
    // const browser = await pie.connect(app, puppeteer as any);

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    debugger;
    console.log("screen::::::", "width", width, "height", height);
    const preload = path.join(__dirname, "preload.js");

    let pathUrl = "";
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        pathUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL;
    } else {
        pathUrl = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
    }

    // if (!electronApp) {
    //     electronApp = await playwright._electron.launch({
    //         args: ["https://sports.mtt.xyz"],
    //     });
    // }

    const setCustomSession = () => {
        // const customSession = session.fromPartition("persist:name");
        // const cachePath = "path/to/your/cache/directory";
        // session.fromPath("./cache");
        // app.setAppLogsPath("/Users/apple/baidu-pan/web3-browser-cache");
        app.setPath("appData", "e:\\cache-test");
        // app.setPath("web3-browser-cache", "/Users/apple/baidu-pan/web3-browser-cache");
        let aa = session.defaultSession.getStoragePath();
        console.log("fdafdafdsfdsafa", aa);
    };
    // const mainWindow: BrowserWindow = (await electronApp.firstWindow()) as any;
    // debugger;

    setCustomSession();

    const mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            devTools: inDevelopment,
            contextIsolation: true,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: false,
            preload: preload,
            webviewTag: true,
        },
        titleBarStyle: "hidden",
    });
    registerListeners(mainWindow);

    const dataConfig: ITaskConfig = JSON.parse(fs.readFileSync("src/task1.config.json", "utf-8"));
    const taskConfig: TaskConfig = TaskConfig.fromJson(JSON.stringify(dataConfig));
    // console.log("dataConfig", dataConfig);

    const webContainerView = new View();
    const containerLayout = new ViewContainerLayout(webContainerView, 6);

    // // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    const top = TOP_MARGIN;
    mainWindow.on("ready-to-show", () => {
        const { height, width } = mainWindow.contentView.getBounds();
        webContainerView?.setBounds({ x: 0, y: top, width, height: height - top });
    });
    mainWindow.on("resize", () => {
        const { height, width } = mainWindow.contentView.getBounds();
        // 更新布局
        containerLayout?.updateLayout(mainWindow.contentView.getBounds());
        webContainerView?.setBounds({ x: 0, y: top, width, height: height - top });
    });

    // mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.send("taskConfig", dataConfig);
    // });

    // mainWindow.webContents.session.setProxy({ proxyRules: "socks5://114.215.193.156:1080" });
    // mainWindow.webContents.session
    //     .setProxy({ proxyRules: "socks5://114.215.193.156:1080" })
    //     .then(() => {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(pathUrl);
    } else {
        mainWindow.loadFile(pathUrl);
    }

    //     // mainWindow.loadURL("https://whatismyipaddress.com/");
    // })
    // .catch((err) => console.error(err));

    // function () {
    //     mainWindow.loadURL("https://whatismyipaddress.com/");
    // }

    app.on("web-contents-created", (event, contents) => {
        contents.setWindowOpenHandler((info) => {
            mainWindow?.webContents.send("webview-url-is-change");
            if (info.disposition === "new-window") {
                return { action: "allow" };
            } else {
                mainWindow?.webContents.send("webview-open-url", info.url);
                return { action: "deny" };
            }
        });
    });

    // // 设置代理
    // const proxyServer = "http://your.proxy.server:port";

    // // 为WebView设置代理
    // session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    //     if (details.resourceType === "mainFrame") {
    //         Object.assign(details.requestHeaders, {
    //             "Proxy-Authorization": `Basic ${Buffer.from("proxyUsername:proxyPassword", "utf8").toString("base64")}`,
    //         });
    //     }
    //     callback({ cancel: false, requestHeaders: details.requestHeaders });
    // });

    // // 设置session代理
    // session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    //     if (details.resourceType === "mainFrame") {
    //         Object.assign(details.requestHeaders, {
    //             "User-Agent": "My-Agent",
    //         });
    //     }
    //     callback({ cancel: false, requestHeaders: details.requestHeaders });
    // });

    // nativeTheme.themeSource = "dark";

    mainWindow.contentView.addChildView(webContainerView);

    // // 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    // // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'

    /**
     * 循环创建tabWebContent、初始化设置创建个数、添加到webContainerView
     */
    const windowList: Array<IWindowState> = taskConfig.getAccountListByIsOpen(true).slice(0, 1);
    // const tabWebCount = taskConfig.getAccountListByIsOpen(true).length; //dataConfig.accountList.length;
    windowList.forEach((win) => {
        // for (let i = 0; i < tabWebCount; i++) {
        // if (i == 0 || i == 2 || i == 3 || i == 5 || i == 1) continue;
        const view = createNewWebTabContent(win);
        webContainerView.addChildView(view);
        containerLayout.addViewLayoutItemModel(view, win);
        // }

        // require("@electron/remote/main").initialize();
        // require("@electron/remote/main").enable(view);
    });

    // const view = createNewWebTabContent(5);
    // webContainerView.addChildView(view);
    // containerLayout.addViewLayoutItemModel(view);

    // 更新布局
    containerLayout.updateLayout(webContainerView.getBounds());
    // });

    // const getState = () => ({
    //     isVisible: mainWindow.isVisible(),
    //     isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
    //     isCrashed: mainWindow.webContents.isCrashed(),
    // });

    // // await app.firstWindow()
    // // const mainWindow = await app.firstWindow();

    // For AppBar
    ipcMain.on("minimize", () => {
        // eslint-disable-next-line no-unused-expressions
        mainWindow.isMinimized() ? mainWindow.restore() : mainWindow.minimize();
        // or alternatively: win.isVisible() ? win.hide() : win.show()
    });
    ipcMain.on("maximize", () => {
        // eslint-disable-next-line no-unused-expressions
        mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
    });

    ipcMain.on("close", () => {
        // mainWindow.close();
        electronApp.close();
    });

    const website = new MttWebSiteHelper();
    // puppeteer 相关
    ipcMain.handle("user:login", website.login);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    // await electronApp.context().newPage

    // debugger;
    // const windowState = await electronApp.evaluateHandle(async ({ BrowserWindow }) => {
    await createWindow();
    // const mainWindow = BrowserWindow.getAllWindows()[0];
    // console.log("mainWindow", mainWindow.isVisible());
    // dialog.showMessageBox({
    //     type: "info",
    //     title: "提示",
    //     message: "ok",
    // });
    // alert('ok')
    //     // const getState = () => ({
    //     //     isVisible: mainWindow.isVisible(),
    //     //     isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
    //     //     isCrashed: mainWindow.webContents.isCrashed(),
    //     // });
    //     // return new Promise((resolve) => {
    //     //     if (mainWindow.isVisible()) {
    //     //         resolve(getState());
    //     //     } else {
    //     //         mainWindow.once("ready-to-show", () => setTimeout(() => resolve(getState()), 0));
    //     //     }
    // });

    // await createWindow();
    // await createPlaywrightWindow();

    // const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
    //     const mainWindow = BrowserWindow.getAllWindows()[0];
    // });

    app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        // if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
        electronApp?.close();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", (event: IpcMainEvent, message: any) => {
    console.log(message);
    setTimeout(() => event.sender.send("message", "common.hiElectron"), 500);
});

const TOP_MARGIN = 60;

class ViewContainerLayout {
    columnMaxQuantity: number = 2;
    currentColumnCount: number = 0;
    marginLine: number = 6;

    // rowItems: ViewLayoutItemModel[][] = [[]];
    itemsMap: Map<View, ViewLayoutItemModel> = new Map();
    lastRowItem: number = 0;

    constructor(parentView: Electron.View, columnMaxQuantity?: number) {
        this.parentView = parentView;
        if (columnMaxQuantity) this.columnMaxQuantity = columnMaxQuantity;
        if (columnMaxQuantity) this.currentColumnCount = columnMaxQuantity;
        this.parentView.on("bounds-changed", () => {
            this.updateLayout(this.parentView?.getBounds());
        });
    }

    /**增加 ViewLayoutItemModel */
    addViewLayoutItemModel(view: WebContentsView, windowState: IWindowState) {
        //获取最后一行item
        // const lastRowItem = this.rowItems[this.rowItems.length - 1];
        // let columnIndex = 0;
        // let viewLayoutItem;
        // //如果横向rowItems数量多余horizontalQuantity、则换行
        // if (lastRowItem.length < this.columnMaxQuantity) {
        //     const rowIndex = this.rowItems.length - 1;
        //     const columnIndex = lastRowItem.length;
        //     // this.rowItems.push([]);
        //     viewLayoutItem = new ViewLayoutItemModel(view, rowIndex, columnIndex);
        //     this.rowItems[rowIndex].push(viewLayoutItem);
        // } else {
        //     this.rowItems.push([]);
        //     console.log("-------- add.row:" + this.rowItems.length + " -----------------");
        let viewLayoutItem = new ViewLayoutItemModel(view, windowState);
        //     this.rowItems[this.rowItems.length - 1].push(viewLayoutItem);
        // }
        this.itemsMap.set(view, viewLayoutItem);

        // this.rowItems[rowIndex]
        //   ? this.rowItems[rowIndex].push(viewLayoutItem)
        //   : (this.rowItems[rowIndex] = [viewLayoutItem]);
        this.updateRowItemCount();
    }

    parentView: Electron.View;

    /**更新根据webview数量计算出每行的数量 */
    updateRowItemCount() {
        if (this.itemsMap.size == 1 || this.itemsMap.size == 2) {
            //设置
            this.itemsMap.forEach((item) => {
                item.setDisplayModel("pc");
            });
        } else if (this.itemsMap.size == 3) {
            //设置
            this.itemsMap.forEach((item) => {
                item.setDisplayModel("mobile");
            });
        } else if (this.itemsMap.size == 4) {
            this.currentColumnCount = 2;
            //设置
            this.itemsMap.forEach((item) => {
                item.setDisplayModel("pc");
            });
        } else {
            this.currentColumnCount = this.columnMaxQuantity;
            this.itemsMap.forEach((item) => {
                item.setDisplayModel("mobile");
            });
        }
    }

    /**
     * 更新布局、根据父容器大小以及列最大数量、自动计算每个view的大小以及位置、加上行列之间的间距marginLine
     */

    updateLayout(parentLayoutBounds: Electron.Rectangle) {
        const { width, height: parentHeight } = parentLayoutBounds;
        const height = parentHeight;
        const columnCount = Math.min(this.itemsMap.size, this.currentColumnCount);
        let rowItems: ViewLayoutItemModel[][] = [[]];
        this.itemsMap.forEach((viewLayoutItem) => {
            let lastRowItem = rowItems[rowItems.length - 1];
            //如果横向rowItems数量多余horizontalQuantity、则换行
            if (lastRowItem.length < columnCount) {
                const rowIndex = rowItems.length - 1;
                rowItems[rowIndex].push(viewLayoutItem);
            } else {
                rowItems.push([]);
                console.log("-------- add.row:" + rowItems.length + " -----------------");
                rowItems[rowItems.length - 1].push(viewLayoutItem);
            }
        });
        // console.log("rowItems", rowItems);
        for (let i = 0; i < rowItems.length; i++) {
            const prevRowItem = rowItems[i - 1] ?? [];
            const rowItem = rowItems[i];
            console.log("-------- row:" + i + " -----------------");
            for (let j = 0; j < rowItem?.length; j++) {
                //根据每行数量获取每列的宽度
                const columnWidth = (width - this.marginLine * (columnCount - 1)) / columnCount;
                //根据每列高度获取每行的高度
                const rowHeight =
                    (height - this.marginLine * (rowItem.length - 1)) / rowItems.length;
                //根据当前行列item获取x，y、需要加上边距、最后一个和第一个无需加边距
                let { x, width: prevWidth } = rowItem[j - 1]?.currentView?.getBounds() ?? {
                    x: 0,
                    width: 0,
                };
                // console.log('------prevWidth x', x, prevWidth + x);
                let { y, height: prevHeight } = prevRowItem[0]?.currentView?.getBounds() || {
                    y: 0,
                    height: 0,
                };

                console.log("------prevWidth y", "row:" + i, "column:" + j, y, prevHeight + y);
                console.log("------rowHeight", rowHeight, height);
                const viewLayoutItemModel = rowItem[j];
                //如果不是第一个item、需要加上左边距
                if (j !== 0) {
                    x = x + this.marginLine;
                }
                if (i !== 0) {
                    y = y + this.marginLine;
                }
                viewLayoutItemModel?.updateLayout(
                    columnWidth,
                    rowHeight,
                    prevWidth + x,
                    prevHeight + y
                );
            }
        }
    }

    // updateTabViewLayout = (containerLayoutBounds: Electron.Rectangle, view: Electron.View) => {
    //   const { width, height } = containerLayoutBounds;

    //   view.setBounds({ x: tabViewWidth + tabSpaceLine, y: 0 + top, width: width / 2, height: tabViewHeight });
    // };
}

class ViewLayoutItemModel {
    currentView: WebContentsView;
    rowIndex: number = 0;
    columnIndex: number = 0;
    windowState: IWindowState;
    constructor(view: WebContentsView, windowState: IWindowState) {
        this.currentView = view;
        this.windowState = windowState;
        // this.rowIndex = rowIndex;
        // this.columnIndex = columnIndex;
    }

    updateRowIndex(rowIndex: number) {
        this.rowIndex = rowIndex;
    }
    updateColumnIndex(columnIndex: number) {
        this.columnIndex = columnIndex;
    }

    updateLayout = (width: number, height: number, x: number, y: number) => {
        // console.log('updateLayout', this);
        this.currentView.setBounds({ x, y, width, height });
    };

    setDisplayModel(model: "pc" | "mobile") {
        switch (model) {
            case "pc":
                this.currentView.webContents.setUserAgent(this.windowState.browser.userAgent.pc);
                this.currentView.webContents.reload();
                // this.currentView.webContents.executeJavaScript(
                //     `
                //     // window.TelegramWebviewProxy = undefined;
                //     window.dispatchEvent(new Event('resize'))
                //     `
                // );
                break;
            case "mobile":
                console.log("mobile------");
                this.currentView.webContents.setUserAgent(
                    this.windowState.browser.userAgent.mobile
                );
                this.currentView.webContents.reload();
                // setTimeout(() => {
                //     this.currentView.webContents.executeJavaScript(
                //         `
                //         // window.TelegramWebviewProxy={};
                //         window.dispatchEvent(new Event('resize'))
                //         `
                //     );
                // }, 300);
                break;
        }
    }
}

const createNewWebTabContent = (windowState: IWindowState) => {
    const { browser, account } = windowState;
    const view1 = new WebContentsView({
        webPreferences: {
            partition: `persist:account-${account.account}`,
        },
    });
    view1.webContents.setUserAgent(
        // `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) electron-shadcnTemplate/1.0.0 Chrome/128.0.6613.178 Electron/32.2.0 Safari/537.36`
        // `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) vite-reactts-electron-starter/0.6.0 Chrome/124.0.6367.243 Electron/30.1.1 Safari/537.36`
        // "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
        browser.userAgent.mobile
    );
    view1.setBackgroundColor("#20293a");
    view1.webContents.session.clearData({ dataTypes: ["cache"] })
    view1.webContents.on("did-finish-load", () => {
        view1.webContents
            .executeJavaScript(
                `
                    // window.TelegramWebviewProxy={};
                    // window.dispatchEvent(new Event('resize'));
                    localStorage.setItem('LanguageCode','zh-TW');
                `
            )
            .finally(() => { });
    });

    // const enforceInheritance = (topWebContents: Electron.WebContents) => {
    //     const handle = (webContents: Electron.WebContents) => {
    //         webContents.on(
    //             'new-window',
    //             (event, url, frameName, disposition, options) => {
    //                 if (!options.webPreferences) {
    //                     options.webPreferences = {};
    //                 }
    //                 Object.assign(
    //                     options.webPreferences,
    //                     topWebContents.getLastWebPreferences()
    //                 );
    //                 if (options.webContents) {
    //                     handle(options.webContents);
    //                 }
    //             }
    //         );
    //     };
    //     handle(topWebContents);
    // };

    // enforceInheritance(view1.webContents);

    // view1.webContents.session.setDisplayMediaRequestHandler((request, callback) => {
    //     desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
    //         console.log('fdsfdsafdsfdsfdsaa2122222')
    //         // Grant access to the first screen found.
    //         callback({ video: sources[0], audio: 'loopback' })
    //     })
    //     // If true, use the system picker if available.
    //     // Note: this is currently experimental. If the system picker
    //     // is available, it will be used and the media request handler
    //     // will not be invoked.
    // }, { useSystemPicker: true })

    view1.webContents.setWindowOpenHandler((details) => {
        return {
            action: 'allow',
            createWindow: (options) => {
                const browserView = new BrowserWindow(options)
                // mainWindow.addBrowserView(browserView)
                // browserView.setBounds({ x: 0, y: 0, width: 640, height: 480 })
                return browserView.webContents
            }
        }
    })


    view1.webContents.on("did-finish-load", () => {
        // 注册脚本以监听 URL 变更
        view1.webContents.executeJavaScript(`

        (function() {
          const originalPushState = history.pushState;
          const originalReplaceState = history.replaceState;
  
          history.pushState = function(state) {
            originalPushState.apply(history, arguments);
            document.dispatchEvent(new Event('url-change'));
          };
  
          history.replaceState = function(state) {
            originalReplaceState.apply(history, arguments);
            document.dispatchEvent(new Event('url-change'));
          };
  
          window.addEventListener('hashchange', function() {
            document.dispatchEvent(new Event('url-change'));
          });
            // 在渲染进程中发送消息到主进程
            document.addEventListener('url-change', () => {
                const currentUrl = window.location.href;
                window.postMessage({ type: 'url-change', url: currentUrl }, '*');
                if(currentUrl.includes('login')){

                }

            });
        })();
      `);
        /**
         * 隐藏turnstile
         */
        view1.webContents.executeJavaScript(`
        (function() {
          const style = document.createElement('style');
          style.innerHTML = \`
            .turnstile-wrapper {
              display: none !important;
            }
          \`;
          document.head.appendChild(style);
        })();
      `);

        view1.webContents.executeJavaScript(`
            (function() {
                // window.addEventListener('DOMContentLoaded', () => {
                //     alert('fdsfdsfds')
                //     const originalOpen = window.open;
                //     window.open = function (url, target, features, replace) {
                //        console.log('fdsafdsfdsafdsfdsa==================')

                //         // 阻止默认的 window.open 行为（可选）
                //         return null;
                //     };
                // });
            })();
          `);

        // 监听自定义事件 'url-change'
        // view1.webContents.on("ipc-message", (event, message) => {
        //     if (message === "url-change") {
        //         const currentUrl = mainWindow.webContents.getURL();
        //         console.log("URL changed to:", currentUrl);
        //         // 进行业务处理
        //         handleUrlChange(currentUrl);
        //     }
        // });
    });
    let proxyUrl = browser.proxy?.getProxyUrl?.();
    // view1.webContents.loadURL("https://sports.mtt.xyz/home/tourney");
    if (proxyUrl) {
        // view1.webContents.session
        //     .setProxy({
        //         proxyRules: "http://104.25.0.210:80",
        //     })
        //     .then((e) => {
        //         view1.webContents.loadURL("https://www.ipip.net");
        //         // view1.webContents.loadURL("https://sports.mtt.xyz/home/tourney");
        //     });
        let proxy = {
            host: "http://104.25.0.210",
            port: 80,
            username: "abc124774961",
            password: "KAwhEZ54jg",
        };
        const filter = {
            urls: ["<all_urls>"],
        };
        // view1.webContents.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
        //     // 设置认证头信息
        //     details.requestHeaders["Proxy-Authorization"] =
        //         "Basic " +
        //         Buffer.from(proxy.username + ":" + proxy.password, "utf8").toString("base64");
        //     callback({ cancel: false, requestHeaders: details.requestHeaders });
        // });
        // 设置代理规则和PAC脚本
        // view1.webContents.session
        //     .setProxy({
        //         proxyRules: "http=104.25.0.210:80;https=104.25.0.210:80",
        //         pacScript: "http://104.25.0.210:80",
        //     })
        //     .then((e) => {
        //         view1.webContents.loadURL("https://www.ipip.net");
        //     });
        // const ses = session.fromPartition(`persist:account-${webTabId}`);
        // ses.setProxy({ proxyRules: "http://142.44.210.174:80" }).then((e) => {
        //     view1.webContents.loadURL("https://www.ipip.net");
        // });
        // proxyRules === 'http://127.0.0.1:[random-port]'
        console.log("proxyUrl", proxyUrl);
        sockProxyRules(proxyUrl).then((proxyRules) => {
            view1.webContents.session.setProxy({ proxyRules }).then((e) => {
                // console.log("fsdfdafdafas");
                view1.webContents.loadURL("https://sports-pre.mtt.xyz");
                // view1.webContents.loadURL("https://www.ipip.net");
            });
        });
        // view1.webContents.loadURL("https://sports.mtt.xyz/home/tourney").then((e) => {
        //     view1.webContents.on("did-finish-load", () => {
        //         view1.webContents
        //             .executeJavaScript(
        //                 `window.TelegramWebviewProxy={};window.dispatchEvent(new Event('resize'))`
        //             )
        //             .finally(() => {});
        //     });
        // });
    } else {
        view1.webContents.loadURL("https://sports.mtt.xyz/home/tourney");
        // .then((e) => {
        //     view1.webContents.on("did-finish-load", () => {
        //         view1.webContents
        //             .executeJavaScript(
        //                 `window.TelegramWebviewProxy={};window.dispatchEvent(new Event('resize'))`
        //             )
        //             .finally(() => {});
        //     });
        // });
    }
    // win.loadURL("https://www.ipip.net");

    return view1;
};

class MttWebSiteHelper {
    login = async () => {
        // let newWin = getCurrentWebContents();
        console.log("login");
        // 模拟点击ID为'myButton'的按钮
        // const button = await remote
        //     .getCurrentWebContents()
        //     .executeJavaScript(`document.getElementById('myButton')`);
        // button.click();
        // const browser = await playwrightCore._electron.launch({
        // headless: false,
        // defaultViewport: { width: 1200, height: 740 },
        // slowMo: 200,
        // ignoreDefaultArgs: [
        //     "--disable-infobars",
        //     "--enable-automation",
        //     "user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
        // ],
        // args: [
        //     "--start-maximized",
        //     "--no-sandbox",
        //     "--disable-setuid-sandbox",
        //     "--disable-blink-features=AutomationControlled",
        // ],
        // dumpio: false,
        // });
    };
}
