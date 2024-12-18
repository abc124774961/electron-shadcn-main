import { makeAutoObservable } from "mobx";

class MttMatchData {
    constructor() {
        makeAutoObservable(this);
    }
    todayMiningCount = -1;
}

export const mttMatchData = new MttMatchData();
