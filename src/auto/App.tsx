import React from "react";
import { useEffect, useReducer, useState } from "react";
import { Menu } from "react-float-menu";
import { Observer } from "mobx-react-lite";

import { autoHandler } from "./AutoHandler";
import { mttMatchData } from "./mttMatchData";
import { mttDomCommon } from "./mttSportsCommon";
import { featFlowHandler } from "./FeatFlowHandler";
export default function App() {
    useEffect(() => {
        autoHandler.startAuto();
    }, []);
    return (
        <Observer>
            {() => {
                return (
                    <div
                        style={{
                            width: "50px",
                            height: "50px",
                            background: autoHandler.runActive ? "green" : "red",
                            borderRadius: "4px",
                            justifyContent: "center",
                            alignItems: "center",
                            display: "flex",
                        }}
                    >
                        <div
                            style={{ fontSize: "12px" }}
                            onClick={() => {
                                featFlowHandler.getTodayMiningCount();
                            }}
                        >
                            今日：
                            {mttMatchData.todayMiningCount == -1
                                ? "--"
                                : mttMatchData.todayMiningCount}
                            {/* {autoHandler.running} */}
                        </div>
                    </div>
                );
            }}
        </Observer>
    );
    // return <></>;
}

// 示例使用
// console.log("-0-----", getCardStyle("7c"));
// console.log("-0-----", getCardStyle("7h"));

//梅花2
//pc background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.49783rem 0rem; background-size: 1.65495rem 1.35446rem; width: 0.161458rem; height: 0.222005rem;
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.738715rem 0rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//黑桃2
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.738715rem -1.68041rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//红桃2
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.99566rem -0.905961rem; background-size: 1.65495rem 1.35446rem; width: 0.161458rem; height: 0.222005rem;
//方块2
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.331887rem -0.67947rem; background-size: 1.65495rem 1.35446rem; width: 0.161458rem; height: 0.222005rem;

//梅花3
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.738715rem -0.336082rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//pc background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.49783rem -0.22649rem; background-size: 1.65495rem 1.35446rem; width: 0.161458rem; height: 0.222005rem;
//红桃3
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.72367rem 0rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//黑桃3
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.984954rem -1.68041rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;

//黑桃4
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.23119rem -1.68041rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//梅花4
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.984954rem 0rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//方块4
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.984954rem -1.00825rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//红桃4
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.72367rem -0.336082rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;

//红桃5
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.72367rem -0.672164rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//方块5
//pc background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.829716rem -0.67947rem; background-size: 1.65495rem 1.35446rem; width: 0.161458rem; height: 0.222005rem;
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.23119rem -1.00825rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//梅花5
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.984954rem -0.336082rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;

//红桃6
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.72367rem -1.00825rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//方块6
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.47743rem 0rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//梅花6
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: 0rem -0.672164rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//黑桃6
// background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.72367rem -1.68041rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;

//黑桃7
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.96991rem -1.68041rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//梅花7
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.246238rem -0.672164rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//红桃7
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.72367rem -1.34433rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;

//黑桃8
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.49349rem 0rem; background-size: 1.65495rem 1.35446rem; width: 0.161458rem; height: 0.222005rem;
//梅花8
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.492477rem -0.672164rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//红桃8
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.96991rem 0rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;

//黑桃9
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.47743rem -1.00825rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;

//黑桃10
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.96991rem -1.34433rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//方块10
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.23119rem -0.336082rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//梅花10
// -0.492477rem 0rem

//黑桃J
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: 0rem -1.68041rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//方块J
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.23119rem -0.672164rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//红桃J
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.738715rem -1.34433rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//梅花J
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: 0rem -0.336082rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;

//黑桃Q
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.246238rem -1.68041rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//方块Q
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: 0rem -1.00825rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//梅花Q
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.246238rem -0.336082rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//红桃Q
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.984954rem -1.34433rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;

//红桃K
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.23119rem -1.34433rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//黑桃K
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.492477rem -1.68041rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//梅花KK
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.492477rem -0.336082rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;

//方块A
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.23119rem 0rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//梅花A
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -0.246238rem 0rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//黑桃A
//mobile background-image: url(&quot;https://localhost/packages/shared/assets/game-pixi/spritesheet/card1-sm-sprite.png&quot;); background-repeat: no-repeat; background-position: -1.96991rem -1.00825rem; background-size: 2.45573rem 2.00984rem; width: 0.239583rem; height: 0.329427rem;
//红桃A
//-0.246238rem -1.34433rem
