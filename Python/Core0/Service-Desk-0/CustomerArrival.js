class CustomerArrival extends eVENT {
  constructor({occTime, delay}) {
    super({occTime, delay});
  }
  onEvent() {
    var followupEvents=[];
    // increment queue length due to newly arrived customer
    sim.model.v.queueLength++;
    // update statistics
    sim.stat.arrivedCustomers++;
    if (sim.model.v.queueLength > sim.stat.maxQueueLength) {
      sim.stat.maxQueueLength = sim.model.v.queueLength;
    }
    // if the service desk is not busy, start service and schedule departure
    if (sim.model.v.queueLength === 1) {
      followupEvents.push( new CustomerDeparture({
        delay: sim.model.f.serviceTime()
      }));
    }
    return followupEvents;
  }
  createNextEvent() {
    return new CustomerArrival({
      delay: CustomerArrival.recurrence()
    });
  }
  static recurrence() {
    return math.getUniformRandomInteger( 1, 6);
  }
}
