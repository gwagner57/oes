class ProcessingStart extends eVENT {
  constructor({ occTime, delay, workStation}) {
    super({occTime, delay});
    this.workStation = workStation;
  }
  onEvent() {
    var followupEvents=[], ws = this.workStation;
    ws.status = "BUSY";
    // schedule the processing end event
    followupEvents.push( new ProcessingEnd({
      delay: WorkStation.processingTime(),
      workStation: ws
    }));
    return followupEvents;
  }
}
