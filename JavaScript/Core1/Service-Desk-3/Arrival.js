class Arrival extends eVENT {
  constructor({ occTime, delay, serviceStation}) {
    super({occTime, delay});
    this.serviceStation = serviceStation;
  }
  onEvent() {
    var followupEvents=[], ws = this.serviceStation;
    // increase buffer length (add part to buffer)
    ws.queueLength++;
    // update statistics
    sim.stat.arrived++;
    if (ws.queueLength > sim.stat.maxQueueLength) {
      sim.stat.maxQueueLength = ws.queueLength;
    }
    // if the work station is available
    if (ws.status === "AVAILABLE") {
      // schedule the part's processing start event
      followupEvents.push( new ServiceStart({ serviceStation: ws}));
    }
    return followupEvents;
  }
  createNextEvent() {
    if (Arrival.maxNmrOfEvents && Arrival.counter >= Arrival.maxNmrOfEvents) {
      return null;
    } else {
      Arrival.counter++;
      return new Arrival({serviceStation: this.serviceStation});
    }
  }
  static recurrence() {return rand.exponential(1/6);}
}
Arrival.counter = 1;  // counting the initial event at 1
