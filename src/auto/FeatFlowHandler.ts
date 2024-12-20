import { runInAction } from "mobx";
import {
    fetchPageDom,
    simulateInput,
    sleep,
    waitForElement,
    waitForPageLoad,
    waitForRouteChange,
} from "./domCommon";
import $ from "jquery";
import { mttMatchData } from "./mttMatchData";
import { EnumPage } from "./types";

class FeatFlowHandler {
    async autoHandlerLoginFlow(account: any) {
        await waitForElement(".login-title");
        await sleep(1400);
        let historyLogin = await waitForElement(".history-login", undefined).catch(() => []);
        if (historyLogin?.length > 0) {
            let switchBtn = await waitForElement("#button-next", undefined);
            switchBtn.trigger("click");
            await sleep(1400);
        }
        await simulateInput("#accountInput input", account.account);
        await sleep(500);
        let switchBtn = await waitForElement("#button-next", undefined);
        switchBtn.trigger("click");
        await sleep(1500);
        await waitForElement(".ant-input-password");
        await simulateInput(".ant-input-password input", account.password);
        await sleep(200);
        let loginBtn = await waitForElement(".mtt-btn");
        loginBtn.trigger("click");
        console.log("route,before", location.href);
        await waitForRouteChange();
        console.log("route,alter", location.href);
    }

    async autoHandlerInputPasswordFlow(password: string) {
        await waitForElement(".ant-input-password");
        await simulateInput(".ant-input-password input", password);
        await sleep(200);
        let loginBtn = await waitForElement(".mtt-btn");
        loginBtn.trigger("click");
        await waitForRouteChange();
    }

    async autoHandlerEnterTableFlow() {
        if (location.pathname == EnumPage.Home1 || location.pathname == EnumPage.Home2) {
            await waitForElement(".home-multi-table").catch(() => []);
        }
        let tables = await waitForElement(".home-multi-table .multi-table", undefined, 5000).catch(
            () => []
        );
        console.log("获取到已进入的桌子：数量", tables.length);
        //进入已进入的桌子中
        if (tables.length > 0) {
            $(tables).find(".multi-table__item:first").trigger("click");
            return true;
        }
        return false;
    }

    getMiningCountByDate() {
        return new Promise((resolve, reject) => {
            fetchPageDom("https://www.baidu.com").then(($) => {
                console.log($.html());
                // let list = $(".history-game-list-item").get();
                debugger;
            });
        });
    }

    async getTodayMiningCount() {
        if (location.pathname != EnumPage.HomeHistory) {
            let nav = await waitForElement(
                ".mobile-bottom-nav .media-header-row",
                undefined,
                5000
            ).catch(() => []);
            // if (nav.length == 0) {
            //     location.replace(EnumPage.Me + "?__autoflow=getTodayMiningCount");
            //     return;
            // }
            let me = $(".mobile-bottom-nav .media-header-row:last");
            if (me.length) {
                me.trigger("click");
                await sleep(300);
            }
            let iconMygame = await waitForElement("span.icon-mygames");
            iconMygame?.trigger("click");
        }
        let historyItem = await waitForElement(".history-game-list-item");
        let todayCount = 0;
        historyItem.each((index, item) => {
            let time = $(item).find("> div > div span:nth-child(2)").html();
            let today = new Date().getDate();
            let day = new Date(time).getDate();
            if (today == day) {
                todayCount++;
            }
        });
        runInAction(() => {
            mttMatchData.todayMiningCount = todayCount;
        });
        console.log("获取到今日已开奖的场次", todayCount);
        return todayCount;
    }

    async autoHandlerEntryListMatchFlow() {
        let list = $(".game-card").get();
        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                if (
                    /\d{0,2}/gi.test($(item).find(".time .text").parent().html()?.toString() || "")
                ) {
                    $(item).trigger("click");
                    break;
                }
            }
        } else {
            list = $(".match-card").get();
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                if (
                    /\d{1,2}/gi.test($(item).find(".match-status").html()?.toString() || "") &&
                    $(item).find(".registered").length == 0
                ) {
                    console.log("点击房间", $(item).find(".match-status").html());
                    $(item).trigger("click");
                    //等待页面跳转完成
                    await waitForPageLoad();
                    console.log("等待页面跳转完成");
                    let buttons = await waitForElement(".btn-panel-wrap button");
                    if (buttons.length == 1) {
                        buttons[0].click();
                        buttons = await waitForElement(
                            ".btn-panel-wrap button",
                            (element) => element.length >= 2
                        );
                        buttons[buttons.length - 1].click();
                    } else if (buttons.length > 1) {
                        buttons[buttons.length - 1].click();
                    }
                    //等待页面跳转完成
                    await waitForPageLoad();
                    break;
                }
            }
        }
    }
}

export const featFlowHandler = new FeatFlowHandler();
