class Failure extends eVENT {
  constructor({ occTime, delay, workStation}) {
    super({occTime, delay});
    this.workStation = workStation;
  }
  onEvent() {
    var followupEvents=[], ws = this.workStation;
    if (ws.status === "AVAILABLE") {
      ws.status = "FAILED";
      followupEvents.push( new RepairStart({
          delay: WorkStation.repairLeadTime(),
          workStation: ws}));
    } else if (ws.status === "BUSY") {
      ws.status = "FAILED";
      followupEvents.push( new ProcessingAbort({workStation: ws}));
    }
    // update statistics
    sim.stat.failures++;
    return followupEvents;
  }
  createNextEvent() {
    return new Failure({workStation: this.workStation});
  }
  static recurrence() {return rand.triangular( 10*60, 50*60, 20*60)};  // min,max,mode;
}
