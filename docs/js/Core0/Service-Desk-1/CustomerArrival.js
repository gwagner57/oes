class CustomerArrival extends eVENT {
  constructor({ occTime, delay, serviceDesk}) {
    super({ occTime, delay});
    this.serviceDesk = serviceDesk;
  }
  onEvent() {
    var followupEvents=[];
    // increment queue length due to newly arrived customer
    this.serviceDesk.queueLength++;
    // update statistics
    sim.stat.arrivedCustomers++;
    if (this.serviceDesk.queueLength > sim.stat.maxQueueLength) {
      sim.stat.maxQueueLength = this.serviceDesk.queueLength;
    }
    // if the service desk is not busy
    if (this.serviceDesk.queueLength === 1) {
      followupEvents.push( new CustomerDeparture({
        delay: ServiceDesk.serviceTime(),
        serviceDesk: this.serviceDesk
      }));
    }
    return followupEvents;
  }
  createNextEvent() {
    return new CustomerArrival({
      delay: CustomerArrival.recurrence(),
      serviceDesk: this.serviceDesk
    });
  }
  static recurrence() {
    return math.getUniformRandomInteger( 1, 6);
  }
}
