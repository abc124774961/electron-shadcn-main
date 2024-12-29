import { PersistentStorageBase, storageProperty } from "../utils/PersistentStorageBase";
import { computed, makeAutoObservable, makeObservable, observable } from "mobx";

class MttMatchData extends PersistentStorageBase {
    constructor() {
        super();
        makeObservable(this);
    }

    @observable
    @storageProperty
    _todayMiningCount = -1;
    get todayMiningCount() {
        return this._todayMiningCount;
    }
    set todayMiningCount(value) {
        this._todayMiningCount = value;
        this.save();
    }

    //获取快速赛数量
    @observable
    @storageProperty
    _quickMatchCount = 0;
    get quickMatchCount() {
        return this._quickMatchCount;
    }
    set quickMatchCount(value) {
        this._quickMatchCount = value;
        this.save();
    }

    @storageProperty
    currentDate: Date = new Date();

    //是否需要重新刷新挖矿数据
    @observable
    needRefreshMiningData = true;

    //周赛奖励统计
    @observable
    @storageProperty
    weekRaceBonusTotal = 0;
    //日赛奖励统计
    @observable
    @storageProperty
    dayRaceBonusTotal = 0;
    //普通挖矿赛奖励统计
    @observable
    @storageProperty
    normalMiningBonusTotal = 0;
    //快速挖矿赛 奖金 统计变量
    @observable
    @storageProperty
    quickRaceBonusTotal = 0;

    //当前奖金总计数
    @computed
    get bonusTotal() {
        let total =
            this.weekRaceBonusTotal +
            this.dayRaceBonusTotal +
            this.normalMiningBonusTotal +
            this.quickRaceBonusTotal;
        return isNaN(total) ? "--" : total;
    }
}

export const mttMatchData = new MttMatchData();
