import { makeAutoObservable, runInAction } from "mobx";
import { mttDomCommon } from "./mttSportsCommon";
import { EnumPage } from "./types";
import { featFlowHandler } from "./FeatFlowHandler";
import { sleep, touchClick, waitForElement } from "./domCommon";
import { Hand } from "pokersolver";
import { getCurrentHandCardsWithTypes } from "./pokerCommon";
import { AutomationConfig } from "./AutomationConfig";
import { mttMatchData } from "./mttMatchData";

export class AutoHandler {
    constructor() {
        makeAutoObservable(this);
    }
    autoStartStatus = false;

    running = false;

    runActive = false;
    activeTime: any;

    automationConfig = new AutomationConfig();

    autoTime: any;

    getAutoflow() {
        let params = new URLSearchParams(location.search);

        if (params.get("__autoflow")) {
            return params.get("__autoflow");
        } else {
            return null;
        }
    }

    startAuto() {
        if (this.autoStartStatus) return;
        console.log("----------------开始自动操作");
        runInAction(async () => {
            this.autoStartStatus = true;
        });
        const { account, autoSetting, id } = window.__env;

        let that = this;

        // window.addEventListener("popstate", function () {
        //     let page = getCurrentPage();
        //     console.log("路由切换", page);
        //     autoTime && this.clearTimeout(autoTime);
        //     runAuto();
        // });
        async function runAuto() {
            let page = mttDomCommon.getCurrentPage();
            try {
                // console.log("当前页面：", page, that.autoMining);
                if (that.getAutoflow()) {
                    let autoflow = that.getAutoflow();
                    console.log("继续上次自动流程：", autoflow);
                    switch (autoflow) {
                        case "getTodayMiningCount":
                            await featFlowHandler.getTodayMiningCount();
                            break;
                        default:
                    }
                } else if (page == EnumPage.Game) {
                    // console.log("自动化监听开始");
                    (await that.autoHandlerStatus(that)) as any;
                } else if (page == EnumPage.Login) {
                    if (that.automationConfig.autoLogin) {
                        await featFlowHandler.autoHandlerLoginFlow(account);
                    }
                } else if (page == EnumPage.VerifyPassword) {
                    await featFlowHandler.autoHandlerInputPasswordFlow(account.password);
                } else if (page == EnumPage.TourneyList5) {
                    if (that.automationConfig.autoMining) {
                        await featFlowHandler.autoHandlerEntryListMatchFlow();
                    }
                } else {
                    // if (page == EnumPage.Home1 || page == EnumPage.Home2) {
                    // console.log("首页");
                    if (that.automationConfig.autoMining) {
                        console.log("跳转至比赛页面");
                        let isEntry = await featFlowHandler.autoHandlerEnterTableFlow();
                        if (!isEntry) {
                            //     let count =
                            //         mttMatchData.todayMiningCount >= 0
                            //             ? mttMatchData.todayMiningCount
                            //             : await featFlowHandler.getTodayMiningCount();
                            //     if (count != undefined && count >= 13) {
                            //         console.log("暂停。。。。。");
                            //         that.automationConfig.setAutoMining(false);
                            //     } else if (count != undefined && count < 13 && count >= 0) {
                            //         // location.href = EnumPage.TourneyList5;
                            //         // location.replace(EnumPage.TourneyList5)
                            //         window.history.go(-2);
                            //         // window.history.pushState(null, "", EnumPage.TourneyList5);
                            //     }
                            location.replace(EnumPage.TourneyList5);
                        }
                    }
                    // } else if (page == EnumPage.Tourney) {
                    //     if (that.automationConfig.autoMining) {
                    //         location.href = EnumPage.TourneyList5;
                    //     }
                    // }
                }
            } catch (error: any) {
                console.log("自动化异常", error);
            }
        }
        this.autoTime = setInterval(async () => {
            if (!this.running) {
                runInAction(async () => {
                    this.running = true;
                    this.runActive = true;
                });
                await runAuto().catch(() => {});
                runInAction(async () => {
                    this.running = false;
                });
            }
        }, 300);

        this.activeTime = setInterval(() => {
            runInAction(async () => {
                this.runActive = false;
            });
        }, 1000);
    }

    async autoHandlerStatus(autoHandler: AutoHandler) {
        let status = mttDomCommon.getCurrentStatus();
        let gameOperationBar = document.querySelector(".game-operation");
        let currentHand = getCurrentHandCardsWithTypes();
        if (currentHand.handTypes.length > 0) {
            console.log("=================================================================");
            console.warn(
                "===当前手牌：",
                currentHand.handTypes.map((e) => e.cardTypeText).join(",")
            );
            console.warn("===当前：", currentHand.handTypes.map((e) => e.cardTypeText).join(","));
            console.warn("===当前基础胜率：", currentHand.winProbability);
            var hand = Hand.solve(currentHand.handTypes.map((e) => e.cardType));
            console.log(hand.name); // Two Pair
            console.log(hand.descr); // Two Pair, A's & Q's
            console.log("=================================================================");
            console.log("");
            console.log("");
            await sleep(1000);
        }
        // console.log("状态：", status);
        if (status.isSittingOut) {
            //回到座位
            let backButton = mttDomCommon.getGoBackSeatButton();
            if (backButton) {
                console.log("backButton click,回到座位中");
                backButton.click();
            }
        } else if (status.isOpenEndedModel) {
            let closeButton = mttDomCommon.getGameOverCloseButton();
            if (closeButton) {
                console.log("closeButton click,点击关闭");
                closeButton.trigger("click");
                await sleep(1000);
            }
            //获取离开按钮
            let exitButton = await waitForElement(".mtt-settlement-wrap .mtt-settlement-exit-btn");
            exitButton.trigger("click");
        } //如果在围观中、则点击推出游戏
        else if (status.isWatching) {
            await sleep(2000);
            status = mttDomCommon.getCurrentStatus();
            if (!status.isWatching) {
                return;
            }
            let gameMenuButton = mttDomCommon.getGameMenuButton();
            //等待游戏菜单按钮出现
            if (!gameOperationBar) {
                console.log("gameMenuButton not found,等待游戏菜单出现");
            }
            if (gameOperationBar) {
                console.log("gameMenuButton click,点击游戏菜单");
                gameMenuButton?.click();
                await sleep(300);
                await sleep(2000);
                let leaveButton = mttDomCommon.getLeaveTableButton();
                if (leaveButton) {
                    console.log("leaveButton click,点击离开桌子");
                    leaveButton?.click();
                    await sleep(2000);
                    let confirmButton = mttDomCommon.getLeaveTableConfirmButton();
                    confirmButton?.click();
                    return;
                }
            }
        } else if (
            this.automationConfig.autoPaly &&
            currentHand.winProbability > 0.5 &&
            status.isMyselfOpreateTime
        ) {
            console.log("当前牌基础胜率：", currentHand.winProbability);
            //获取all in按钮
            let allInButton = await mttDomCommon.getAllInButton();
            if (allInButton) {
                console.log("allInButton click,点击all in");
                touchClick(allInButton);
                await sleep(1000);
            }
        }
        //操作时间是否快结束
        else if (status.isOpreateTimeToEnd) {
            console.log("操作时间快结束", status.callPrice);

            //是否存在check按钮
            if (status.isAllowCheck) {
                console.log("存在check按钮");
                let checkButton = mttDomCommon.getCheckButton();
                if (checkButton) {
                    console.log("checkButton click,点击check");
                    touchClick(checkButton);
                    await sleep(2000);
                }
            } else if (status.callPrice >= 0 && status.callPrice <= 0) {
                //点击跟注
                let callButton = mttDomCommon.getCallButton();
                if (callButton) {
                    console.log("callButton click,点击跟注", status.callPrice);
                    touchClick(callButton);
                    await sleep(2000);
                }
            } else {
                //点击弃牌
                let foldButton = mttDomCommon.getFoldButton();
                if (foldButton) {
                    console.log("foldButton click,点击弃牌");
                    touchClick(foldButton);
                    await sleep(2000);
                }
            }
        }

        // return setTimeout(() => {
        //     autoHandlerStatus();
        // }, 400);
    }
}

export const autoHandler = new AutoHandler();
