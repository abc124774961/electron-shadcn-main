import { observable, makeAutoObservable, runInAction } from "mobx";
import $ from "jquery";
import { Hand } from "pokersolver";

//enum 当前页面枚举
enum EnumPage {
    Game = "/game",
    Home1 = "/home",
    Home2 = "/",
    Tourney = "/home/tourney",
    //挖矿赛列表5
    TourneyList5 = "/home/tourneyList?view=5",
    Competition = "/home/competition",
    VerifyPassword = "/oauth2/verifyPassword",
    Login = "/oauth2/login",
}

//获取当前处于的页面
function getCurrentPage() {
    let url = window.location.href;
    let pathname = window.location.pathname;
    if (pathname == EnumPage.Game) {
        return EnumPage.Game;
    } else if (pathname == EnumPage.Home1) {
        return EnumPage.Home1;
    } else if (pathname == EnumPage.Home2) {
        return EnumPage.Home2;
    } else if (pathname == EnumPage.Tourney) {
        return EnumPage.Tourney;
    } else if (pathname == EnumPage.Competition) {
        return EnumPage.Competition;
    } else if (url.includes(EnumPage.TourneyList5)) {
        return EnumPage.TourneyList5;
    } else if (url.includes(EnumPage.VerifyPassword)) {
        return EnumPage.VerifyPassword;
    } else if (url.includes(EnumPage.Login)) {
        return EnumPage.Login;
    }
}

async function autoHandlerStatus(autoHandler: AutoHandler) {
    let status = getCurrentStatus();
    let gameOperationBar = document.querySelector(".game-operation");
    let currentHand = getCurrentHandCardsWithTypes();
    if (currentHand.handTypes.length > 0) {
        console.log("=================================================================");
        console.warn("===当前手牌：", currentHand.handTypes.map((e) => e.cardTypeText).join(","));
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
        let backButton = getGoBackSeatButton();
        if (backButton) {
            console.log("backButton click,回到座位中");
            backButton.click();
        }
    } else if (status.isOpenEndedModel) {
        let closeButton = getGameOverCloseButton();
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
        status = getCurrentStatus();
        if (!status.isWatching) {
            return;
        }
        let gameMenuButton = getGameMenuButton();
        //等待游戏菜单按钮出现
        if (!gameOperationBar) {
            console.log("gameMenuButton not found,等待游戏菜单出现");
        }
        if (gameOperationBar) {
            console.log("gameMenuButton click,点击游戏菜单");
            gameMenuButton?.click();
            await sleep(300);
            await sleep(2000);
            let leaveButton = getLeaveTableButton();
            if (leaveButton) {
                console.log("leaveButton click,点击离开桌子");
                leaveButton?.click();
                await sleep(2000);
                let confirmButton = getLeaveTableConfirmButton();
                confirmButton?.click();
                return;
            }
        }
    } else if (
        autoHandler.autoPaly &&
        currentHand.winProbability > 0.5 &&
        status.isMyselfOpreateTime
    ) {
        console.log("当前牌基础胜率：", currentHand.winProbability);
        //获取all in按钮
        let allInButton = await getAllInButton();
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
            let checkButton = getCheckButton();
            if (checkButton) {
                console.log("checkButton click,点击check");
                touchClick(checkButton);
                await sleep(2000);
            }
        } else if (status.callPrice >= 0 && status.callPrice <= 0) {
            //点击跟注
            let callButton = getCallButton();
            if (callButton) {
                console.log("callButton click,点击跟注", status.callPrice);
                touchClick(callButton);
                await sleep(2000);
            }
        } else {
            //点击弃牌
            let foldButton = getFoldButton();
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

async function autoHandlerEntryMatchFlow() {
    let list = $(".gameSlick:first .game-card-item-wrap").get();
    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            if (/\d{0,2}/gi.test($(item).find(".time .text").parent().html()?.toString() || "")) {
                $(item).find(`.media-game-card`).trigger("click");
                break;
            }
        }
    } else {
        list = $(".match-card").get();
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            if (/\d{0,2}/gi.test($(item).find(".time .text").parent().html()?.toString() || "")) {
                $(item).trigger("click");
                break;
            }
        }
    }
}
async function autoHandlerLoginFlow(account: any) {
    await waitForElement(".login-title");
    let historyLogin = await waitForElement(".history-login", undefined, 200).catch(() => []);
    if (historyLogin?.length > 0) {
        let switchBtn = await waitForElement("#button-next", undefined, 200);
        switchBtn.trigger("click");
        await sleep(400);
    }
    await simulateInput("#accountInput input", account.account);
    await sleep(200);
    let switchBtn = await waitForElement("#button-next", undefined, 200);
    switchBtn.trigger("click");
    await waitForElement(".ant-input-password");
    await simulateInput(".ant-input-password input", account.password);
    await sleep(200);
    let loginBtn = await waitForElement(".mtt-btn");
    loginBtn.trigger("click");
    await sleep(3000);
}

async function autoHandlerInputPasswordFlow(password: string) {
    await waitForElement(".ant-input-password");
    await simulateInput(".ant-input-password input", password);
    await sleep(200);
    let loginBtn = await waitForElement(".mtt-btn");
    loginBtn.trigger("click");
    await sleep(3000);
}

async function autoHandlerEnterTableFlow() {
    let elements = await waitForElement(".multi-table", undefined, 10000).catch(() => []);
    console.log("获取到已进入的桌子：数量", elements.length);
    //进入已进入的桌子中
    if (elements.length > 0) {
        $(elements).find(".multi-table__item:first").trigger("click");
        return true;
    }
    return false;
}

async function autoHandlerEntryListMatchFlow() {
    let list = $(".game-card").get();
    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            if (/\d{0,2}/gi.test($(item).find(".time .text").parent().html()?.toString() || "")) {
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

function getGoBackSeatButton(): HTMLDivElement | undefined {
    if (document.querySelector(".game-operation .btn--back")) {
        return document.querySelector(".game-operation .btn--back") as HTMLDivElement;
    } else if (document.querySelectorAll(".game-operation .game-operation-button")?.length == 1) {
        return (document.querySelectorAll(".game-operation .game-operation-button") as any)[0];
    }
}

//获取游戏菜单按钮
function getGameMenuButton() {
    return document.querySelector(".game-more .game-more-info__menu") as HTMLDivElement;
}

//获取离开桌子按钮
function getLeaveTableButton() {
    return document.querySelectorAll(
        ".ant-drawer-content-wrapper .ant-drawer-body button"
    )[1] as HTMLDivElement;
}

//获取确认桌子确认按钮
function getLeaveTableConfirmButton() {
    return document.querySelector(".exit-confirm .btn-green") as HTMLDivElement;
}

// game-operation-button__text main multiline span
//获取check按钮
function getCheckButton() {
    return document.querySelectorAll(".game-operation .game-operation-button.main")[1];
}

//获取call按钮
function getCallButton() {
    return document.querySelector(
        ".game-operation .game-operation-button__text.main.multiline span"
    )?.parentElement;
}

//获取桌子弃牌按钮
function getFoldButton() {
    // return document.querySelectorAll('.game-operation .game-operation-button.main')[0] as HTMLDivElement;
    return document.querySelectorAll(".game-operation .game-operation-button.main")[0];
}

//获取游戏结束画面弹出关闭按钮
function getGameOverCloseButton() {
    return $(".game-rank-modal .close-btn") || $(".game-section .close-btn");
}

//获取当前小桌手牌element
export function getCurrentHandCardsElement() {
    return $(".multi-table .isCurrent .card div");
}

//获取加注按钮
function getMoreRaiseButton() {
    return $(".game-operation .game-operation-button.main:last .game-operation-button__wrap");
}

//获取加注按钮
function getMoreAllinButton() {
    return $(
        ".game-operation .operation-panel-raise-vertical-btn .game-operation-button .game-operation-button__wrap:last"
    );
}
// game-operation-button main
// game-operation-button__wrap game-operate-button-red
async function getAllInButton() {
    let moreRaiseButton = getMoreRaiseButton();
    console.log("moreRaiseButton", moreRaiseButton.length);
    if (moreRaiseButton.length > 0) {
        touchClick(moreRaiseButton.get()[0]);
        await sleep(500);
        let moreAllinButton = getMoreAllinButton();
        touchClick(moreAllinButton.get()[0]);
        await sleep(500);
    }
    return $(".game-operation .game-operation-button.main")[2];
}
// operation-panel-raise-vertical-btn
// game-operation-button__wrap game-operate-button-red
function touchClick(element: HTMLElement) {
    // 创建一个鼠标点击事件
    var mouseClickEvent = new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    // 创建一个触摸结束事件
    var touchEndEvent = new TouchEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    var event = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    // 触发鼠标点击事件
    element.dispatchEvent(mouseClickEvent);
    // // 触发触摸结束事件
    element.dispatchEvent(touchEndEvent);
    element.dispatchEvent(event);
}

const getCurrentStatus = () => {
    let currentLayout = document.querySelector(".game-multi-table .isCurrent");
    let parentDiv = currentLayout?.parentElement as HTMLDivElement;
    //等待中
    let isIniting = !!currentLayout?.querySelector(".multi-table__item__content-match-init");

    //有牌
    let isExistCard = !!currentLayout?.querySelector(".hand-card-box");

    //围观中
    let isWatching = !!currentLayout?.querySelector(".multi-table__item__content-observing");

    //是否等待中
    let isWaiting = !!currentLayout?.querySelector(".multi-table__item__content-waiting");

    //获取当前操作剩余时间
    //获取scale 获取旋转角度,1.007, 1.007
    let timeValue = (currentLayout?.querySelector("svg path") as any)?.attributes[
        "stroke-dasharray"
    ]?.nodeValue;
    //正则获取当中一个数值
    let timeArray = timeValue ? timeValue.match(/(.*?),/) : [];

    let time = Number(timeArray?.[1]);
    // console.log('time', timeValue, timeValue?.[1].match(/(.*?),/), time);
    // console.log('time', timeArray, time);
    let isOpreateTime = isNaN(time) ? false : true;

    //获取操作时间是否已经快到结束时刻
    let isOpreateTimeToEnd = time < 10 ? true : false;

    //获取操作时间是否已经快到结束时刻
    let isMyselfOpreateTime = time > 0 ? true : false;

    let isOpenEndedModel =
        $(".game-rank-modal .close-btn").length > 0 ||
        $(".mtt-settlement-wrap .mtt-settlement-exit-btn").length > 0;

    //是否到了自己操作时间
    // let isTimeOut = timeElement ? Number(timeElement[1]) < 0.5 : false;

    //获取跟注价格
    let callPrice = 0;

    //获取check是否存在按钮
    let isAllowCheck;
    //check按钮
    let checkPrice = (
        document.querySelector(
            ".game-operation .game-operation-button__text.main.multiline span"
        ) as HTMLDivElement
    )?.innerHTML;
    if (
        document.querySelector(".game-operation .game-operation-button__text.main.multiline span")
    ) {
        isAllowCheck = true;
    }
    if (checkPrice) {
        isAllowCheck = false;
        callPrice = Number(checkPrice.replace(/,/gi, ""));
        // console.log("跟注价格：", callPrice);
    }

    //状态
    let statusText =
        (
            currentLayout?.querySelector(
                ".game-multi-table .isCurrent .multi-table__item__content-managed"
            ) as HTMLDivElement
        )?.innerText || "Unknown";
    let isSittingOut = statusText.includes("Out");

    // let isSittingOut = statusText.includes('Out');
    //弃牌
    let isFold = !!currentLayout?.querySelector(".fold");
    return {
        isIniting,
        isFold,
        isExistCard,
        isSittingOut,
        isWatching,
        isWaiting,
        isOpreateTime,
        isOpreateTimeToEnd,
        isAllowCheck,
        callPrice,
        isOpenEndedModel,
        isMyselfOpreateTime,
    };
};

/**
 * 创建一个返回 Promise 的函数，该 Promise 在指定的毫秒数后解析。
 *
 * @param arg0 延迟的时间（毫秒）
 * @returns 返回一个 Promise，该 Promise 在指定的毫秒数后解析
 */
function sleep(arg0: number) {
    return new Promise((resolve) => setTimeout(resolve, arg0));
}

export class AutoHandler {
    constructor() {
        makeAutoObservable(this);
    }
    autoStartStatus = false;

    running = false;

    startAuto() {
        if (this.autoStartStatus) return;
        console.log("----------------开始自动操作");
        runInAction(async () => {
            this.autoStartStatus = true;
        });
        const { account, autoSetting } = window.__env;

        let autoTime: any;
        let that = this;
        // window.addEventListener("popstate", function () {
        //     let page = getCurrentPage();
        //     console.log("路由切换", page);
        //     autoTime && this.clearTimeout(autoTime);
        //     runAuto();
        // });
        async function runAuto() {
            let page = getCurrentPage();
            try {
                // console.log("当前页面：", page, that.autoMining);
                if (page == EnumPage.Game) {
                    // console.log("自动化监听开始");
                    (await autoHandlerStatus(that)) as any;
                } else if (page == EnumPage.Login) {
                    await autoHandlerLoginFlow(account);
                } else if (page == EnumPage.VerifyPassword) {
                    await autoHandlerInputPasswordFlow(account.password);
                } else if (page == EnumPage.Home1 || page == EnumPage.Home2) {
                    // console.log("首页");
                    if (that.autoMining) {
                        console.log("跳转至比赛页面");
                        let isEntry = await autoHandlerEnterTableFlow();
                        if (!isEntry) {
                            location.href = EnumPage.TourneyList5;
                        }
                    }
                } else if (page == EnumPage.Tourney) {
                    if (that.autoMining) {
                        location.href = EnumPage.TourneyList5;
                    }
                } else if (page == EnumPage.TourneyList5) {
                    if (that.autoMining) {
                        await autoHandlerEntryListMatchFlow();
                    }
                }
            } catch (error: any) {
                console.log("自动化异常", error);
            }
        }
        autoTime = setInterval(async () => {
            if (!this.running) {
                runInAction(async () => {
                    this.running = true;
                });
                await runAuto();
                runInAction(async () => {
                    this.running = false;
                });
            }
        }, 300);
    }

    get autoPaly() {
        return window.__env?.autoSetting?.autoPlay;
    }

    get autoMining() {
        return window.__env?.autoSetting?.autoMining;
    }
}

export const autoHandler = new AutoHandler();

// setTimeout(() => {
//     startAuto();
// }, 2000);

async function waitForPageLoad(
    targetNode?: Node,
    config: MutationObserverInit = { childList: true, subtree: true }
): Promise<void> {
    let _targetNode = targetNode;
    if (!_targetNode) _targetNode = document.querySelector(".box-content") as Node;
    return new Promise((resolve) => {
        const observer = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === "childList") {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                    observer.disconnect();
                    break;
                }
            }
        });

        observer.observe(_targetNode, config);
    });
}

async function waitForElement(
    selector: string,
    condition?: (element: JQuery<HTMLElement>) => boolean,
    timeout: number = 10000
): Promise<JQuery<HTMLElement>> {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "childList") {
                    checkElement();
                }
            }
        });

        const checkElement = () => {
            const element = $(selector);
            if (element.length > 0) {
                if (!condition || condition(element)) {
                    observer.disconnect();
                    resolve(element);
                }
            }
        };

        checkElement();

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            reject(
                new Error(
                    `Element with selector "${selector}" not found or condition not met within ${timeout}ms`
                )
            );
        }, timeout);
    });
}

// 定义扑克牌的花色和数值
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

const suitsMap = { h: "红桃♥", d: "方块♦", c: "梅花♣", s: "黑桃♠" };

// 生成扑克牌键值对
const pokerDeck: string[] = [];

console.log(pokerDeck);

const CARD_SPRITE_URL =
    "https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png";
const CARD_SIZE = { width: "0.239583rem", height: "0.329427rem" };
const SPRITE_SHEET_SIZE = { width: "2.45573rem", height: "2.00984rem" };

const suits = ["s", "h", "c", "d"]; // 红桃h、方块d、梅花c、黑桃s
ranks.forEach((rank) => {
    suits.forEach((suit) => {
        const card = `${rank}${suit}`;
        pokerDeck.push(card);
    });
});
const cardValueMap: { [key: string]: number } = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    T: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
};

const cardConfig = {
    //2
    "2s": { position: "-0.738715rem -1.68041rem" }, //1
    "2h": { position: "-1.47743rem -1.34433rem" }, //1
    "2c": { position: "-0.738715rem 0rem" }, //1
    "2d": { position: "-0.492477rem -1.00825rem" }, //1
    //3
    "3s": { position: "-0.984954rem -1.68041rem" }, //1
    "3h": { position: "-1.72367rem 0rem" }, //1
    "3c": { position: "-0.738715rem -0.336082rem" }, //1
    "3d": { position: "-0.738715rem -1.00825rem" }, //1
    //4
    "4s": { position: "-1.23119rem -1.68041rem" }, //1
    "4h": { position: "-1.72367rem -0.336082rem" }, //1
    "4c": { position: "-0.984954rem 0rem" }, //1
    "4d": { position: "-0.984954rem -1.00825rem" }, //1
    //5
    "5s": { position: "" },
    "5h": { position: "-1.72367rem -0.672164rem" }, //1
    "5c": { position: "-0.984954rem -0.336082rem" }, //1
    "5d": { position: "-1.23119rem -1.00825rem" }, //1
    //6
    "6s": { position: "-1.72367rem -1.68041rem" }, //1
    "6h": { position: "-1.72367rem -1.00825rem" }, //1
    "6c": { position: "0rem -0.672164rem" }, //1
    "6d": { position: "-1.47743rem 0rem" },
    //7
    "7s": { position: "-1.96991rem -1.68041rem" }, //1
    "7h": { position: "-1.72367rem -1.34433rem" }, //1
    "7c": { position: "-0.246238rem -0.672164rem" }, //1
    "7d": { position: "-1.47743rem -0.336082rem" }, //1
    //8
    "8s": { position: "-2.21615rem 0rem" }, //1d
    "8h": { position: "-1.96991rem 0rem" }, //1
    "8c": { position: "-0.492477rem -0.672164rem" },
    "8d": { position: "-1.47743rem -0.672164rem" }, //1
    //9
    "9s": { position: "-2.21615rem -0.336082rem" }, //1
    "9h": { position: "-1.96991rem -0.336082rem" }, //1
    "9c": { position: "-0.738715rem -0.672164rem" }, //1
    "9d": { position: "-1.47743rem -1.00825rem" }, //1
    //10
    Ts: { position: "-1.96991rem -1.34433rem" },
    Th: { position: "-0.492477rem -1.34433rem" }, //1
    Tc: { position: "-0.492477rem 0rem" }, //1
    Td: { position: "-1.23119rem -0.336082rem" }, //1
    //J
    Js: { position: "0rem -1.68041rem" }, //1
    Jd: { position: "-1.23119rem -0.672164rem" },
    Jh: { position: "-0.738715rem -1.34433rem" },
    Jc: { position: "" },
    //Q
    Qs: { position: "-0.246238rem -1.68041rem" }, //1
    Qh: { position: "-0.984954rem -1.34433rem" }, //1
    Qc: { position: "-0.246238rem -0.336082rem" },
    Qd: { position: "0rem -1.00825rem" }, //1
    //K
    Kh: { position: "-1.23119rem -1.34433rem" }, //1
    Ks: { position: "-0.492477rem -1.68041rem" }, //1
    Kc: { position: "-0.492477rem -0.336082rem" }, //1
    Kd: { position: "-0.246238rem -1.00825rem" }, //1
    //A
    Ah: { position: "-0.246238rem -1.34433rem" },
    Ac: { position: "-0.246238rem 0rem" }, //1
    As: { position: "-1.96991rem -1.00825rem" }, //1
    Ad: { position: "-1.23119rem 0rem" }, //1
};

function getCardStyle(cardName: string): { [key: string]: string } {
    const config = cardConfig[cardName];
    if (!config) {
        console.error(`Card configuration not found for ${cardName}`);
        return {
            "background-image": `url("${CARD_SPRITE_URL}")`,
            "background-repeat": "no-repeat",
            "background-position": "0 0",
            "background-size": `${SPRITE_SHEET_SIZE.width} ${SPRITE_SHEET_SIZE.height}`,
            width: `${CARD_SIZE.width}`,
            height: `${CARD_SIZE.height}`,
        };
    }

    const position = config.position;
    const size = config.size || CARD_SIZE;

    return {
        "background-image": `url("${CARD_SPRITE_URL}")`,
        "background-repeat": "no-repeat",
        "background-position": position,
        "background-size": `${SPRITE_SHEET_SIZE.width} ${SPRITE_SHEET_SIZE.height}`,
        width: `${size.width}`,
        height: `${size.height}`,
    };
}

// 创建映射表
const positionToCardTypeMap: { [key: string]: string } = {};

for (const cardName in cardConfig) {
    if (cardConfig.hasOwnProperty(cardName)) {
        const config = cardConfig[cardName];
        positionToCardTypeMap[config.position] = cardName;
    }
}

// 函数：根据 element 的 background-position 获取 card type
export function getCardTypeFromElement(element: HTMLElement): string | null {
    // const style = window.getComputedStyle(element);
    // $(".multi-table .isCurrent .card div:first").get()[0].style.backgroundPosition
    const backgroundPosition = element.style.backgroundPosition;

    if (backgroundPosition in positionToCardTypeMap) {
        return positionToCardTypeMap[backgroundPosition];
    } else {
        console.error(`Unknown background-position: ${backgroundPosition}`);
        return null;
    }
}

// 封装获取当前手牌的函数
export function getCurrentHandCardsWithTypes(): {
    winProbability: number;
    handPorkerNumber: string;
    handTypes: {
        isExistCard: boolean;
        element: HTMLElement;
        cardType: string | null;
        cardTypeText: string | null;
    }[];
} {
    let elements = getCurrentHandCardsElement();
    // console.log("======", elements);

    let handTypes = elements.get().map((element: HTMLElement) => {
        const cardType = getCardTypeFromElement(element);
        console.log("元素坐标：", cardType, element.style.backgroundPosition);
        return {
            isExistCard: cardType ? true : false,
            element,
            cardType,
            cardTypeText: suitsMap[cardType?.charAt(1)] + cardType?.charAt(0),
        };
    });

    function getHandPorkerNumber() {
        return handTypes
            .sort(
                (a, b) => cardValueMap[b.cardType?.charAt(0)] - cardValueMap[a.cardType?.charAt(0)]
            )
            .join("");
    }
    const winProbability = calculateWinProbability(
        handTypes.map((hand) => hand?.cardType?.charAt(0))
    );
    return {
        winProbability: winProbability,
        handTypes: handTypes,
    };
}

// 假设有一个函数可以计算给定手牌的胜率
function calculateWinProbability(hand: string[]): number {
    // 这里只是一个示例，实际实现需要更复杂的逻辑
    // 可以使用外部库或API来实现
    const handRank = {
        AA: 0.85,
        KK: 0.82,
        QQ: 0.79,
        JJ: 0.76,
        TT: 0.73,
        "99": 0.7,
        "88": 0.67,
        "77": 0.64,
        "66": 0.61,
        "55": 0.58,
        "44": 0.55,
        "33": 0.52,
        "22": 0.49,
        AK: 0.57,
        AQ: 0.54,
        AJ: 0.51,
        AT: 0.48,
        A9: 0.45,
        A8: 0.42,
        A7: 0.39,
        A6: 0.36,
        A5: 0.33,
        A4: 0.3,
        A3: 0.27,
        A2: 0.24,
        KQ: 0.51,
        KJ: 0.48,
        KT: 0.45,
        K9: 0.42,
        K8: 0.39,
        K7: 0.36,
        K6: 0.33,
        K5: 0.3,
        K4: 0.27,
        K3: 0.24,
        K2: 0.21,
        QJ: 0.48,
        QT: 0.45,
        Q9: 0.42,
        Q8: 0.39,
        Q7: 0.36,
        Q6: 0.33,
        Q5: 0.3,
        Q4: 0.27,
        Q3: 0.24,
        Q2: 0.21,
        JT: 0.45,
        J9: 0.42,
        J8: 0.39,
        J7: 0.36,
        J6: 0.33,
        J5: 0.3,
        J4: 0.27,
        J3: 0.24,
        J2: 0.21,
        T9: 0.42,
        T8: 0.39,
        T7: 0.36,
        T6: 0.33,
        T5: 0.3,
        T4: 0.27,
        T3: 0.24,
        T2: 0.21,
        "98": 0.39,
        "97": 0.36,
        "96": 0.33,
        "95": 0.3,
        "94": 0.27,
        "93": 0.24,
        "92": 0.21,
        "87": 0.36,
        "86": 0.33,
        "85": 0.3,
        "84": 0.27,
        "83": 0.24,
        "82": 0.21,
        "76": 0.33,
        "75": 0.3,
        "74": 0.27,
        "73": 0.24,
        "72": 0.21,
        "65": 0.3,
        "64": 0.27,
        "63": 0.24,
        "62": 0.21,
        "54": 0.27,
        "53": 0.24,
        "52": 0.21,
        "43": 0.24,
        "42": 0.21,
        "32": 0.21,
    };

    const handStr = hand.sort((a, b) => cardValueMap[b] - cardValueMap[a]).join("");
    console.log("handStr", hand, handStr);
    return handRank[handStr] || 0.2; // 默认胜率为0.2
}

async function simulateInput(selector: string, text: string, interval: number = 100) {
    try {
        const inputElement = await waitForElement(selector);
        if (inputElement.length === 0) {
            throw new Error(`Element with selector "${selector}" not found`);
        }

        inputElement.trigger("focusin");
        // 清空输入框
        inputElement.val("");

        // 模拟逐个字符输入
        for (let char of text) {
            const keyCode = char.charCodeAt(0);

            // 触发 keydown 事件
            inputElement.trigger({
                type: "keydown",
                key: char,
                keyCode: keyCode,
                which: keyCode,
            });

            // 触发 keypress 事件
            inputElement.trigger({
                type: "keypress",
                key: char,
                keyCode: keyCode,
                which: keyCode,
            });

            // 更新输入框的值
            //inputid是需要赋值的input的id
            let event = new Event("input", { bubbles: true });
            let input = inputElement.get(0);
            if (input) {
                input.value = inputElement.val() + char;
                let tracker = input._valueTracker;
                if (tracker) {
                    tracker.setValue(inputElement.val() + char);
                }
                input.dispatchEvent(event);
                inputElement.get(0)?.dispatchEvent(event);
            }

            // 触发 input 事件
            inputElement.trigger("input");

            // 触发 keyup 事件
            inputElement.trigger({
                type: "keyup",
                key: char,
                keyCode: keyCode,
                which: keyCode,
            });

            await sleep(interval); // 模拟打字间隔
        }
    } catch (error) {
        console.error("Error simulating input:", error);
    }
}
