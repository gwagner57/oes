class Arrival extends eVENT {
  constructor({ occTime, delay, serviceDesk}) {
    super({occTime, delay});
    this.serviceDesk = serviceDesk;
  }
  onEvent() {
    var followupEvents=[], ws = this.serviceDesk;
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
      followupEvents.push( new ServiceStart({ serviceDesk: ws}));
    }
    return followupEvents;
  }
  createNextEvent() {
    if (Arrival.maxNmrOfEvents && Arrival.counter >= Arrival.maxNmrOfEvents) {
      return null;
    } else {
      Arrival.counter++;
      return new Arrival({serviceDesk: this.serviceDesk});
    }
  }
  static recurrence() {return rand.exponential(1/6);}
}
Arrival.counter = 1;  // counting the initial event at 1
