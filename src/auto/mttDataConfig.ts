export const cardConfig = {
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
    "5s": { position: "-1.47743rem -1.68041rem" }, //1
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
    Ts: { position: "-1.96991rem -1.34433rem" }, //1
    Th: { position: "-0.492477rem -1.34433rem" }, //1
    Tc: { position: "-0.492477rem 0rem" }, //1
    Td: { position: "-1.23119rem -0.336082rem" }, //1
    //J
    Js: { position: "0rem -1.68041rem" }, //1
    Jh: { position: "-0.738715rem -1.34433rem" },
    Jc: { position: "0rem -0.336082rem" }, //1
    Jd: { position: "-1.23119rem -0.672164rem" }, //1
    //Q
    Qs: { position: "-0.246238rem -1.68041rem" }, //1
    Qh: { position: "-0.984954rem -1.34433rem" }, //1
    Qc: { position: "-0.246238rem -0.336082rem" }, //1
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

// 创建映射表
export const positionToCardTypeMap: { [key: string]: string } = {};

for (const cardName in cardConfig) {
    if (cardConfig.hasOwnProperty(cardName)) {
        const config = cardConfig[cardName];
        positionToCardTypeMap[config.position] = cardName;
    }
}
