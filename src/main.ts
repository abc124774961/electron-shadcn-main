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
    BaseWindow,
    WebContentsViewConstructorOptions,
    WebContents,
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
import { sockProxyRules } from "./utils/socksSessionProxy";

const inDevelopment = process.env.NODE_ENV === "development";

let electronApp: ElectronApplication;
async function createWindow() {
    // await pie.initialize(app);
    // const browser = await pie.connect(app, puppeteer as any);

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
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
        app.setPath("appData", "e:\\web3browser-cache");
        // app.setPath("web3-browser-cache", "/Users/apple/baidu-pan/web3-browser-cache");
        let aa = session.defaultSession.getStoragePath();
        console.log("fdafdafdsfdsafa", aa);
    };

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
    const containerLayout = new ViewContainerLayoutManager(webContainerView, 7);

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

    mainWindow.webContents.send("taskConfig", dataConfig);

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(pathUrl);
    } else {
        mainWindow.loadFile(pathUrl);
    }

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

    mainWindow.contentView.addChildView(webContainerView);

    // // 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    // // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'

    /**
     * 循环创建tabWebContent、初始化设置创建个数、添加到webContainerView
     */
    const windowList: Array<IWindowState> = taskConfig.getWindowList();
    // const tabWebCount = taskConfig.getAccountListByIsOpen(true).length; //dataConfig.accountList.length;
    windowList.forEach((win) => {
        // const view = createNewWebTabContent(win);
        const web3Window = new Web3Window(win);
        web3Window.init(containerLayout);
        web3Window.appendToWindow();
        // let webviewContainer = containerLayout.addViewLayoutItemModel(view, win);
        // webContainerView.addChildView(webviewContainer.getContainer());
    });

    // 更新布局
    containerLayout.updateLayout(webContainerView.getBounds());

    initWebviewConfiguration(mainWindow.webContents);
    mainWindow.webContents.on("did-finish-load", () => {
        // console.log("did-finish-load");
        initWebviewConfiguration(mainWindow.webContents);
    });

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
        mainWindow.close();
        electronApp.close();
    });

    const website = new MttWebSiteHelper();
    // puppeteer 相关
    ipcMain.handle("user:login", website.login);

    // puppeteer 相关
    ipcMain.handle("web3:reload", SubWebwebHelper.reload);
    ipcMain.handle("web3:setIsAllowCamera", SubWebwebHelper.setIsAllowCamera);
    ipcMain.handle("web3:setWindowIsOpen", SubWebwebHelper.setWindowIsOpen);
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

class ViewContainerLayoutManager {
    columnMaxQuantity: number = 2;
    currentColumnCount: number = 0;
    marginLine: number = 2;
    parentView: Electron.View;

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

    getParentContainerView() {
        return this.parentView;
    }

    /**增加 ViewLayoutItemModel */
    createViewLayoutItemModel(
        webview: Web3WebView,
        windowState: IWindowState
    ): ViewLayoutItemModel {
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
        let viewLayoutItem = new ViewLayoutItemModel(webview, windowState);
        //     this.rowItems[this.rowItems.length - 1].push(viewLayoutItem);
        // }
        this.itemsMap.set(webview, viewLayoutItem);

        // this.rowItems[rowIndex]
        //   ? this.rowItems[rowIndex].push(viewLayoutItem)
        //   : (this.rowItems[rowIndex] = [viewLayoutItem]);
        this.updateRowItemCount();
        return viewLayoutItem;
    }

    removeItem(webview: Web3WebView) {
        //    const viewLayoutItem= this.itemsMap.get(webview)
        this.itemsMap.delete(webview);
        // viewLayoutItem?.removeViewFromParent()
        this.updateRowItemCount();
    }

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
        } else if (this.itemsMap.size == 6) {
            this.currentColumnCount = 5;
            //设置
            this.itemsMap.forEach((item) => {
                item.setDisplayModel("mobile");
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
            // console.log("-------- row:" + i + " -----------------");
            for (let j = 0; j < rowItem?.length; j++) {
                //根据每行数量获取每列的宽度
                const columnWidth = (width - this.marginLine * (columnCount - 1)) / columnCount;
                //根据每列高度获取每行的高度
                const rowHeight =
                    (height - this.marginLine * (rowItem.length - 1)) / rowItems.length;
                //根据当前行列item获取x，y、需要加上边距、最后一个和第一个无需加边距
                let { x, width: prevWidth } = rowItem[j - 1]?.getContainer()?.getBounds() ?? {
                    x: 0,
                    width: 0,
                };
                let { y, height: prevHeight } = prevRowItem[0]?.getContainer()?.getBounds() || {
                    y: 0,
                    height: 0,
                };

                // console.log("------prevWidth y", "row:" + i, "column:" + j, y, prevHeight + y);
                // console.log("------rowHeight", rowHeight, height);
                const viewLayoutItemModel = rowItem[j];
                //如果不是第一个item、需要加上左边距
                if (j !== 0) {
                    x = x + this.marginLine;
                }
                if (i !== 0) {
                    y = y + this.marginLine;
                }
                // console.log('------prevWidth x', x, prevWidth + x);
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
    currentView: Web3WebView;
    rowIndex: number = 0;
    columnIndex: number = 0;
    windowState: IWindowState;
    webviewContainer: View;
    constructor(view: Web3WebView, windowState: IWindowState) {
        this.currentView = view;
        this.windowState = windowState;
        // this.rowIndex = rowIndex;
        // this.columnIndex = columnIndex;
        this.webviewContainer = createWebviewContainer(view, windowState);
    }

    getContainer() {
        return this.webviewContainer;
    }

    updateRowIndex(rowIndex: number) {
        this.rowIndex = rowIndex;
    }
    updateColumnIndex(columnIndex: number) {
        this.columnIndex = columnIndex;
    }

    updateLayout = (width: number, height: number, x: number, y: number) => {
        // console.log("updateLayout", x, y, width, height);
        this.webviewContainer.setBounds({ x, y, width, height });
    };

    setDisplayModel(model: "pc" | "mobile") {
        switch (model) {
            case "pc":
                this.currentView.webContents.setUserAgent(this.windowState.browser.userAgent.pc);
                // this.currentView.webContents.reloadIgnoringCache();
                // this.currentView.webContents.executeJavaScript(
                //     `
                //     // window.TelegramWebviewProxy = undefined;
                //     window.dispatchEvent(new Event('resize'))
                //     `
                // );
                break;
            case "mobile":
                this.currentView.webContents.setUserAgent(
                    this.windowState.browser.userAgent.mobile
                );
                // this.currentView.webContents.reload();
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

    removeViewFromParent(parent: View) {
        parent.removeChildView(this.webviewContainer);
    }
}

const createNewWebTabContent = (windowState: IWindowState) => {
    const { browser, account } = windowState;
    const view1 = new Web3WebView({
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
    // view1.webContents.session.clearData({ dataTypes: ["cache"] });
    view1.webContents.on("did-finish-load", () => {
        view1.webContents
            .executeJavaScript(
                `
                    // window.TelegramWebviewProxy={};
                    // window.dispatchEvent(new Event('resize'));
                    localStorage.setItem('LanguageCode','zh-TW');
                `
            )
            .finally(() => {});
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

    const primaryDisplay = screen.getPrimaryDisplay();
    /**
     *
     */
    view1.webContents.setWindowOpenHandler((details) => {
        const { width, height } = primaryDisplay.workAreaSize;
        // mainWindow.addBrowserView(browserView)
        // browserView.setBounds({
        //     x: width / 2 - width / 2 / 2,
        //     y: height / 2 - height / 2 / 2,
        //     width: width / 2,
        //     height: height / 1.5,
        // });
        console.log("faceUrl:", details.url);
        if (Web3AppConfig.isAllowCamara && details.url.includes("face")) {
            const browserView = new BrowserWindow();
            let winHeight = 780;
            browserView.setBounds({
                x: width / 2,
                y: winHeight / 2 - winHeight / 2 / 2,
                width: 460,
                height: winHeight,
            });
            // browserView.webContents.session.resolveProxy()
            browserView.webContents.setUserAgent(windowState.browser.userAgent.mobile);
            browserView.webContents.loadURL(details.url);
            return null;
        } else {
            // https://face.mtt.xyz/entry?txId=673e241c335475a47823fe4c&lang=zh-TW&redirectUrl=https%3A%2F%2Fsports-pre.mtt.xyz%2Fhome%2Fwallet?
            return {
                action: "allow",
                createWindow: (options) => {
                    console.log("new-window");
                    const { width, height } = primaryDisplay.workAreaSize;
                    // options.width = width / 2;
                    // options.height = height / 2;
                    const browserView = new BrowserWindow(options);
                    // mainWindow.addBrowserView(browserView)
                    browserView.setBounds({
                        x: width / 2 - width / 2 / 2,
                        y: height / 2 - height / 2 / 2,
                        width: width / 2,
                        height: height / 1.5,
                    });
                    return browserView.webContents;
                },
            };
        }
    });

    // 监听权限请求事件
    view1.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === "media") {
            // 拒绝摄像头权限
            callback(Web3AppConfig.isAllowCamara);
        } else {
            // 其他权限请求默认允许
            callback(true);
        }
    });

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
        console.log("proxyUrl", proxyUrl);
        sockProxyRules(proxyUrl).then((proxyRules) => {
            view1.webContents.session.setProxy({ proxyRules }).then((e) => {
                // console.log("fsdfdafdafas");
                view1.webContents.loadURL("https://sports-pre.mtt.xyz");
                // view1.webContents.loadURL("https://www.ipip.net");
            });
        });
        view1.webContents.addListener("preload-error", () => {
            console.log("preload-error");
        });
    } else {
        view1.webContents.loadURL("https://sports.mtt.xyz/home/tourney");
    }
    // win.loadURL("https://www.ipip.net");

    return view1;
};

class Web3Window {
    window: IWindowState;
    web3Webview?: Web3WebView;
    web3Container?: ViewLayoutItemModel;
    viewContainerLayoutManager?: ViewContainerLayoutManager;
    constructor(win: IWindowState) {
        this.window = win;
        SubWebwebHelper.add(win.account.account, this);
    }

    init(viewContainerLayoutManager: ViewContainerLayoutManager) {
        this.viewContainerLayoutManager = viewContainerLayoutManager;
    }

    visible(win: IWindowState) {
        this.window = win;
        const view = createNewWebTabContent(win);
        this.web3Webview = view;
        // containerLayout.addViewLayoutItemModel(view, win);
    }

    appendToWindow() {
        console.log("this.window.isOpen", this.window.isOpen);
        if (this.window.isOpen) {
            console.log("web3Webview", this.web3Webview ? "存在" : "不存在");
            if (!this.web3Webview) {
                this.visible(this.window);
            }
            if (this.web3Webview) {
                this.web3Container = this.viewContainerLayoutManager?.createViewLayoutItemModel(
                    this.web3Webview,
                    this.window
                );
                if (this.web3Container?.getContainer()) {
                    this.viewContainerLayoutManager?.parentView.addChildView(
                        this.web3Container?.getContainer()
                    );
                    this.viewContainerLayoutManager?.updateLayout(
                        this.viewContainerLayoutManager?.parentView.getBounds()
                    );
                }
            }
        }
    }

    destory() {
        if (this.web3Webview && this.web3Container?.getContainer()) {
            this.viewContainerLayoutManager?.parentView.removeChildView(
                this.web3Container?.getContainer()
            );
            this.viewContainerLayoutManager?.removeItem(this.web3Webview);
            this.web3Webview = undefined;
            this.web3Container = undefined;
            this.viewContainerLayoutManager?.updateLayout(
                this.viewContainerLayoutManager?.parentView.getBounds()
            );
        }
    }
}

class Web3WebView extends WebContentsView {
    constructor(options: WebContentsViewConstructorOptions) {
        super(options);
    }
}

const createWebviewContainer = (webview: WebContentsView, windowState: IWindowState) => {
    const view = new View();
    view.setBackgroundColor("red");
    // view.setBounds({ x: 0, y: 0, width: 100, height: 100 });
    let toolBarHeight = 32;

    const updateLayout = (parentBound: Electron.Rectangle) => {
        // console.log("bounds-changed", view.getBounds(), view.children.length);
        let layout = view.getBounds();
        layout.height -= toolBarHeight;
        layout.y = 0 + toolBarHeight;
        layout.x = 0;
        webview.setBounds(layout);

        let toolBarLayout = { ...parentBound };
        toolBarLayout.height = toolBarHeight;
        toolBarLayout.y = 0;
        toolBarLayout.x = 0;
        toolBarLayout.width = parentBound.width;
        toolbarWebview.setBounds(toolBarLayout);
    };
    view.on("bounds-changed", () => {
        updateLayout(view.getBounds());
    });

    const preload = path.join(__dirname, "preload.js");

    const toolbarWebview = new WebContentsView({
        webPreferences: {
            devTools: inDevelopment,
            contextIsolation: true,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: false,
            preload: preload,
            webviewTag: true,
        },
    });
    // toolbarWebview.setBackgroundColor("blue");

    let pathUrl = "";
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        pathUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL + "/toolbar.html";
    } else {
        pathUrl = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/toolbar.html`);
    }
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        toolbarWebview.webContents.loadURL(pathUrl);
    } else {
        toolbarWebview.webContents.loadFile(pathUrl);
    }
    initWebviewConfiguration(toolbarWebview.webContents, windowState);
    toolbarWebview.webContents.on("did-finish-load", () => {
        console.log("toolbarWebview did-finish-load", windowState.account.account);
        initWebviewConfiguration(toolbarWebview.webContents, windowState);
    });
    // console.log("MAIN_WINDOW_VITE_DEV_SERVER_URL", MAIN_WINDOW_VITE_DEV_SERVER_URL);

    view.addChildView(toolbarWebview);
    view.addChildView(webview);

    updateLayout(view.getBounds());
    return view;
};

class SubWebwebHelper {
    static mapWeb3Window: Map<string, Web3Window> = new Map<string, Web3Window>();
    static async reload(event: any, id: string) {
        console.log("reload", id);
        let webview = SubWebwebHelper.mapWeb3Window.get(id);
        // this.mapSubWebview.
        // SubWebwebHelper.mapSubWebview.get(id)?.currentView.webContents.reload();

        let browser = webview?.window.browser;
        let proxyUrl = browser?.proxy?.getProxyUrl?.();
        const web3Content = webview?.web3Webview?.webContents;
        if (web3Content) {
            web3Content.session.clearData({ dataTypes: ["cache"] }).then((e) => {
                if (proxyUrl) {
                    sockProxyRules(proxyUrl).then(async (proxyRules) => {
                        await web3Content.session.forceReloadProxyConfig();
                        web3Content.session.setProxy({ proxyRules }).then((e) => {
                            // console.log("fsdfdafdafas");
                            web3Content.loadURL("https://sports-pre.mtt.xyz");
                            // view1.webContents.loadURL("https://www.ipip.net");
                            web3Content.reload();
                        });
                    });
                } else {
                    web3Content.reload();
                }
            });
        }
    }

    static add(id: string, view: Web3Window) {
        this.mapWeb3Window.set(id, view);
    }

    static setIsAllowCamera(event: any, allow: boolean, id: string) {
        Web3AppConfig.isAllowCamara = allow;
        console.log("setIsAllowCamera.allow", Web3AppConfig.isAllowCamara);
    }
    static setWindowIsOpen(event: any, open: boolean, id: string) {
        let webview = SubWebwebHelper.mapWeb3Window.get(id);
        if (webview?.window) {
            webview.window.isOpen = open;
        }
        if (open) {
            webview?.appendToWindow();
        } else {
            webview?.destory();
        }
        console.log("setWindowIsOpen.open", id, open);
    }
}

function initWebviewConfiguration(webContents: WebContents, window?: IWindowState) {
    webContents.executeJavaScript(
        `window.__env = {
            id:'${window?.account?.account}',
            password:'${window?.account?.password}',
            kyc:'${window?.account?.kyc || ""}',
            config:{
                isAllowCamara:${Web3AppConfig.isAllowCamara}
            }
        };`
    );
}

class Web3AppConfig {
    static isAllowCamara: boolean = false;
}

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

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;
