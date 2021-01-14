class PartArrival extends eVENT {
  constructor({ occTime, delay, workStation}) {
    super({occTime, delay});
    this.workStation = workStation;
  }
  onEvent() {
    var followupEvents=[], ws = this.workStation;
    // increase buffer length (add part to buffer)
    ws.inputBufferLength++;
    // update statistics
    sim.stat.arrivedParts++;
    if (ws.inputBufferLength > sim.stat.maxQueueLength) {
      sim.stat.maxQueueLength = ws.inputBufferLength;
    }
    // if the work station is available
    if (ws.status === "AVAILABLE") {
      // schedule the part's processing start event
      followupEvents.push( new ProcessingStart({ workStation: ws}));
    }
    return followupEvents;
  }
  createNextEvent() {
    if (PartArrival.maxNmrOfEvents && PartArrival.counter >= PartArrival.maxNmrOfEvents) {
      return null;
    } else {
      PartArrival.counter++;
      return new PartArrival({
        delay: PartArrival.recurrence(),
        workStation: this.workStation
      });
    }
  }
  static recurrence() {return rand.exponential(1/6);}
}
PartArrival.counter = 1;  // counting the initial event at 1
