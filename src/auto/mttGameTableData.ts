import $ from "jquery";

class MttGameTableData {
    constructor() {}
    //当前排名
    private _rank: number = -1;

    //当前排名
    get rank() {
        return this._rank;
    }

    set rank(value: number) {
        this._rank = value;
    }

    //当前平均筹码
    private _chip: number = -1;

    //当前平均筹码
    get chip() {
        return this._chip;
    }

    set chip(value: number) {
        this._chip = value;
    }

    //剩余人数
    private _remainPlayer: number = -1;
    //剩余人数
    get remainPlayer() {
        return this._remainPlayer;
    }

    set remainPlayer(value: number) {
        this._remainPlayer = value;
    }

    //总人数
    private _totalPlayer: number = -1;
    //总人数
    get totalPlayer() {
        return this._totalPlayer;
    }

    set totalPlayer(value: number) {
        this._totalPlayer = value;
    }

    //奖圈人数
    private _prizePlayer: number = -1;
    //奖圈人数
    get prizePlayer() {
        return this._prizePlayer;
    }

    set prizePlayer(value: number) {
        this._prizePlayer = value;
    }

    //游戏剩余多少人数结束
    private _remainPlayerToEnd: number = -1;

    //游戏剩余多少人数结束
    get remainPlayerToEnd() {
        return this._remainPlayerToEnd;
    }
    set remainPlayerToEnd(value: number) {
        this._remainPlayerToEnd = value;
    }

    static getCurrentTableData(): MttGameTableData {
        return mttGameTableData;
    }

    //更新table数据
    updateTableData(data: any) {
        this.rank = data.rank;
        this.chip = data.chip;
        this.remainPlayer = data.remainPlayer;
        this.totalPlayer = data.totalPlayer;
        this.prizePlayer = data.prizePlayer;
        this.remainPlayerToEnd = data.remainPlayerToEnd;
    }

    //定时更新table数据
    updateTableDataByTimer() {
        //定时器更新数据
        setInterval(() => {
            //获取当前页面的table数据
            const tableData = document.querySelector(".board-mini");
            if (tableData) {
                let remainPlayer: number;
                let totalPlayer: number;
                let remainPlayerToEnd: number = -1;

                //剩余选手
                remainPlayer = Number(
                    $(tableData).find(".item-con .item .value span .bold").html().replace(",", "")
                );
                //总玩家数量
                totalPlayer = Number(
                    $(tableData).find(".item-con .item .value span:last").html().replace(",", "")
                );

                const leftElement = $(".players-left");
                if (
                    $(leftElement).find("span.label").html()?.includes("結束") ||
                    $(leftElement).find("span.label").html()?.includes("left")
                ) {
                    //游戏结束人数
                    remainPlayerToEnd = Number(
                        $(leftElement).find(".value .num").html().replace(",", "")
                    );
                }

                console.log(
                    "剩余玩家数量：",
                    this.remainPlayer,
                    "总玩家数量：",
                    this.totalPlayer,
                    this.remainPlayerToEnd
                );
                this.remainPlayer = remainPlayer;
                this.totalPlayer = totalPlayer;
                this.remainPlayerToEnd = remainPlayerToEnd;
            }
        }, 400);
    }

    //释放定时器
    releaseTimer() {}
}

const mttGameTableData = new MttGameTableData();

export default MttGameTableData;
