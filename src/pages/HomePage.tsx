import React, { useEffect, useRef } from "react";
import ToggleTheme from "@/components/ToggleTheme";
import { useTranslation } from "react-i18next";
import LangToggle from "@/components/LangToggle";
import { WebContentsView } from "electron/main";
import TaskUtil from "@/task/TaskUtil";
import { observer } from "mobx-react-lite";
import TaskConfig from "@/task/TaskConfig";

import "./HomePage.scss";
import classNames from "classnames";

TaskUtil.initDataFromConfig(window.qeConfig?.dataConfig());

export default (function HomePage() {
    const { t } = useTranslation();
    const refWebviews = useRef<HTMLWebViewElement[]>([]);

    const accountList = TaskUtil.currentTaskConfig?.getAccountListByIsOpen();

    useEffect(() => {
        // TaskUtil.initDataFromConfig(window.qeConfig?.dataConfig());
        // setInterval(() => {
        console.log("accountList", TaskUtil.currentTaskConfig);
        // }, 2000);
    }, []);

    let classArray = ["w-full", "w-1/2", "w-1/3", "w-1/4", "w-1/5"];

    let columnCountS = "w-1/1";
    if ((accountList?.length || 0) == 4) {
        columnCountS = classArray[1];
    } else if ((accountList?.length || 0) < 6) {
        columnCountS = classArray[(accountList?.length || 1) - 1];
    } else {
        columnCountS = `w-1/6`;
    }
    useEffect(() => {
        refWebviews.current.forEach((webview, i) => {
            console.log("refWebviews.current[i]", webview.ownerDocument.onload);
            let win = webview.ownerDocument.getRootNode() as HTMLDocument;
            // (
            //     "window.TelegramWebviewProxy = {}",
            //     webview.ownerDocument
            // );
            // setTimeout(() => {
            //     // win.location.href = win.location.href;
            //     // win.documentElement.pa
            //     win.TelegramWebviewProxy = {};
            //     win.dispatchEvent(new Event("resize"));
            //     debugger
            // }, 2000);
            // // debugger;
            // webview.ownerDocument.addEventListener("loadstart", () => {
            //     console.log("loadstart", "ok");
            //     debugger;
            //     alert("1111");
            // });
            // webview.ownerDocument.addEventListener("load", () => {
            //     debugger;
            // });
            // webview.content
            // console.log("refWebviews.current[i]", refWebviews.current[i]);
            // webview.addEventListener("", () => {
            //     // setTimeout(() => {
            //     //     // webview..executeJavaScript(
            //     //     webview.TelegramWebviewProxy = {};
            //     //     webview.dispatchEvent(new Event("resize"));
            //     //     // );
            //     // }, 300);
            // });
        });
    }, []);
    // columnCountS,
    return (
        <>
            <div className="main-box md:flex-no-wrap flex h-screen flex-wrap justify-start">
                {accountList?.map((item, i) => {
                    return (
                        <webview
                            ref={(ref) => (refWebviews.current[i] = ref)}
                            className={classNames(`h-1/1`, columnCountS)}
                            key={item.account}
                            // id="myWebView"
                            src={"https://sports.mtt.xyz/home/tourney"}
                            // src={"https://local.mtt.xyz/home/tourney"}
                            // src={
                            //     "https://sports.mtt.xyz/home/competition?matchType=2&matchKey=1850116092307963904"
                            // }
                            partition={`persist:account-${item.account}`}
                            // style={{ height: "40%" }}
                            plugins
                            httpreferrer={"https://sports.mtt.xyz/"}
                            allowpopups={true}
                            webpreferences="allowRunningInsecureContent, javascript=yes"
                            // useragent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                        ></webview>
                    );
                })}
                {/* <webview
                    id="myWebView"
                    src="https://sports.mtt.xyz/"
                    partition="persist:account-abc123456"
                    style={{ width: "1200px", height: "1000px" }}
                    httpreferrer={"https://sports.mtt.xyz/"}
                    allowpopups={true}
                    webpreferences="allowRunningInsecureContent, javascript=no"
                ></webview> */}
                {/* <h1 className="text-4xl font-bold">{t("title")}</h1>
                <LangToggle />
                <ToggleTheme /> */}
            </div>
        </>
    );
});

class ViewContainerLayout {
    columnMaxQuantity: number = 2;
    currentColumnCount: number = 0;
    marginLine: number = 6;

    // rowItems: ViewLayoutItemModel[][] = [[]];
    itemsMap: Map<WebContentsView, ViewLayoutItemModel> = new Map();
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
    addViewLayoutItemModel(view: WebContentsView) {
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
        let viewLayoutItem = new ViewLayoutItemModel(view);
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
    constructor(view: WebContentsView) {
        this.currentView = view;
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
                this.currentView.webContents.executeJavaScript(
                    `window.TelegramWebviewProxy=undefined;window.dispatchEvent(new Event('resize'))`
                );
                break;
            case "mobile":
                console.log("mobile------");
                setTimeout(() => {
                    this.currentView.webContents.executeJavaScript(
                        `window.TelegramWebviewProxy={};window.dispatchEvent(new Event('resize'))`
                    );
                }, 300);
                break;
        }
    }
}
