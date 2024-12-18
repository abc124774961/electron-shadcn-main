import { sleep, touchClick } from "./domCommon";
import { EnumPage } from "./types";

class MttDomCommon {
    getGoBackSeatButton(): HTMLDivElement | undefined {
        if (document.querySelector(".game-operation .btn--back")) {
            return document.querySelector(".game-operation .btn--back") as HTMLDivElement;
        } else if (
            document.querySelectorAll(".game-operation .game-operation-button")?.length == 1
        ) {
            return (document.querySelectorAll(".game-operation .game-operation-button") as any)[0];
        }
    }

    //获取游戏菜单按钮
    getGameMenuButton() {
        return document.querySelector(".game-more .game-more-info__menu") as HTMLDivElement;
    }

    //获取离开桌子按钮
    getLeaveTableButton() {
        return document.querySelectorAll(
            ".ant-drawer-content-wrapper .ant-drawer-body button"
        )[1] as HTMLDivElement;
    }

    //获取确认桌子确认按钮
    getLeaveTableConfirmButton() {
        return document.querySelector(".exit-confirm .btn-green") as HTMLDivElement;
    }

    // game-operation-button__text main multiline span
    //获取check按钮
    getCheckButton() {
        return document.querySelectorAll(".game-operation .game-operation-button.main")[1];
    }

    //获取call按钮
    getCallButton() {
        return document.querySelector(
            ".game-operation .game-operation-button__text.main.multiline span"
        )?.parentElement;
    }

    //获取桌子弃牌按钮
    getFoldButton() {
        // return document.querySelectorAll('.game-operation .game-operation-button.main')[0] as HTMLDivElement;
        return document.querySelectorAll(".game-operation .game-operation-button.main")[0];
    }

    //获取游戏结束画面弹出关闭按钮
    getGameOverCloseButton() {
        return $(".game-rank-modal .close-btn") || $(".game-section .close-btn");
    }

    //获取当前小桌手牌element
    getCurrentHandCardsElement() {
        return $(".multi-table .isCurrent .card div");
    }

    //获取加注按钮
    getMoreRaiseButton() {
        return $(".game-operation .game-operation-button.main:last .game-operation-button__wrap");
    }

    //获取加注按钮
    getMoreAllinButton() {
        return $(
            ".game-operation .operation-panel-raise-vertical-btn .game-operation-button .game-operation-button__wrap:last"
        );
    }
    // game-operation-button main
    // game-operation-button__wrap game-operate-button-red
    async getAllInButton() {
        let moreRaiseButton = this.getMoreRaiseButton();
        console.log("moreRaiseButton", moreRaiseButton.length);
        if (moreRaiseButton.length > 0) {
            touchClick(moreRaiseButton.get()[0]);
            await sleep(500);
            let moreAllinButton = this.getMoreAllinButton();
            touchClick(moreAllinButton.get()[0]);
            await sleep(500);
        }
        return $(".game-operation .game-operation-button.main")[2];
    }

    //获取当前处于的页面
    getCurrentPage() {
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

    // operation-panel-raise-vertical-btn
    // game-operation-button__wrap game-operate-button-red

    getCurrentStatus = () => {
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

        //获取是否已经快到操作时间
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
            document.querySelector(
                ".game-operation .game-operation-button__text.main.multiline span"
            )
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
}

export const mttDomCommon = new MttDomCommon();
