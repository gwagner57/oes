class ProcessingEnd extends eVENT {
  constructor({ occTime, delay, workStation}) {
    super({occTime, delay});
    this.workStation = workStation;
  }
  onEvent() {
    var followupEvents=[], ws = this.workStation;
    // decrease buffer length (remove part from buffer)
    ws.inputBufferLength--;
    // update statistics
    sim.stat.departedParts++;
    // if there are still parts waiting
    if (ws.inputBufferLength > 0) {
      // schedule the next processing start event
      followupEvents.push( new ProcessingStart({ workStation: ws}));
    } else {  // buffer empty
      ws.status = "AVAILABLE";
    }
    return followupEvents;
  }
}
