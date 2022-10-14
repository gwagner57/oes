class RepairEnd extends eVENT {
  constructor({ occTime, delay, workStation}) {
    super({occTime, delay});
    this.workStation = workStation;
  }
  onEvent() {
    var followupEvents=[], ws = this.workStation;
    ws.status = "AVAILABLE";
    if (ws.inputBufferLength > 0) {
      followupEvents.push( new ProcessingStart({ workStation: ws}));
    }
    return followupEvents;
  }
}
