import {
    simulateInput,
    sleep,
    waitForElement,
    waitForPageLoad,
    waitForRouteChange,
} from "./domCommon";

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
        let elements = await waitForElement(".multi-table", undefined, 10000).catch(() => []);
        console.log("获取到已进入的桌子：数量", elements.length);
        //进入已进入的桌子中
        if (elements.length > 0) {
            $(elements).find(".multi-table__item:first").trigger("click");
            return true;
        }
        return false;
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
                    break;
                }
            }
        }
    }
}

export const featFlowHandler = new FeatFlowHandler();
