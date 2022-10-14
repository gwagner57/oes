class ProcessingAbort extends eVENT {
  constructor({ occTime, delay, workStation}) {
    super({occTime, delay});
    this.workStation = workStation;
  }
  onEvent() {
    var followupEvents=[], ws = this.workStation;
    // update statistics
    sim.stat.abortions++;
    followupEvents.push( new RepairStart({
        delay: WorkStation.repairLeadTime(),
        workStation: ws}));
    return followupEvents;
  }
}
