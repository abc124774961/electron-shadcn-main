import $ from "jquery";
import { mttDomCommon } from "./mttSportsCommon";
import { positionToCardTypeMap } from "./mttDataConfig";

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

// setTimeout(() => {
//     startAuto();
// }, 2000);

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
    let elements = mttDomCommon.getCurrentHandCardsElement();
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
