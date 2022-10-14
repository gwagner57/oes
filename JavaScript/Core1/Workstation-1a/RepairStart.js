class RepairStart extends eVENT {
  constructor({ occTime, delay, workStation}) {
    super({occTime, delay});
    this.workStation = workStation;
  }
  onEvent() {
    var followupEvents=[], ws = this.workStation;
    // schedule the repair end event
    followupEvents.push( new RepairEnd({delay: WorkStation.repairTime(), workStation: ws}));
    return followupEvents;
  }
}
