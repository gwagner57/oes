class PartArrival extends eVENT {
  constructor({ occTime, delay, workStation}) {
    super({occTime, delay});
    this.workStation = workStation;
  }
  onEvent() {
    var followupEvents=[];
    // update statistics
    sim.stat.arrivedParts++;
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
PartArrival.successorActivity = "Processing";
PartArrival.counter = 1;
