//enum 当前页面枚举
enum EnumPage {
    Game = "/game",
    Home = "/home",
}

//获取当前处于的页面
function getCurrentPage() {
    let url = window.location.href;
    if (url.includes(EnumPage.Game)) {
        return EnumPage.Game;
    } else if (url.includes(EnumPage.Home)) {
        return EnumPage.Home;
    }
}

async function autoHandlerStatus() {
    let status = getCurrentStatus();
    let gameOperationBar = document.querySelector(".game-operation");
    // console.log("状态：", status);
    if (status.isSittingOut) {
        //回到座位
        let backButton = getGoBackSeatButton();
        if (backButton) {
            console.log("backButton click,回到座位中");
            backButton.click();
        }
    }
    //如果在围观中、则点击推出游戏
    else if (status.isWatching) {
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
        } else if (status.callPrice > 0 && status.callPrice <= 800) {
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

    return setTimeout(() => {
        autoHandlerStatus();
    }, 400);
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
    return document.querySelectorAll(".game-operation .game-operation-button.main")[1];
}

//获取桌子弃牌按钮
function getFoldButton() {
    // return document.querySelectorAll('.game-operation .game-operation-button.main')[0] as HTMLDivElement;
    return document.querySelectorAll(".game-operation .game-operation-button.main")[0];
}

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
    let isOpreateTimeToEnd = time < 20 ? true : false;

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

function startAuto() {
    let autoTime: any;
    console.log("content ui loaded");
    // window.addEventListener("popstate", function () {
    //     let page = getCurrentPage();
    //     console.log("路由切换", page);
    //     autoTime && this.clearTimeout(autoTime);
    //     runAuto();
    // });
    async function runAuto() {
        let page = getCurrentPage();
        // console.log("当前页面：", page, window.document);
        if (page == EnumPage.Game) {
            // console.log("自动化监听开始");
            autoTime = (await autoHandlerStatus()) as any;
        }
    }
    let running = false;
    autoTime = setInterval(async () => {
        if (!running) {
            running = true;
            await runAuto();
            running = false;
        }
    }, 300);
}

setTimeout(() => {
    startAuto();
}, 2000);
