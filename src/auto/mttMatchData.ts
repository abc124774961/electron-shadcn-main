import { PersistentStorageBase, storageProperty } from "../utils/PersistentStorageBase";
import { makeAutoObservable, makeObservable, observable } from "mobx";

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
}

export const mttMatchData = new MttMatchData();
