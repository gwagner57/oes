class CustomerArrival extends eVENT {
  constructor({ occTime, delay, serviceDesk}) {
    super({occTime, delay});
    this.serviceDesk = serviceDesk;
    this.customer = null;  // is assigned on occurrence
  }
  onEvent() {
    var followupEvents=[];
    // create new customer object
    this.customer = new Customer({arrivalTime: this.occTime});
    // push new customer to the queue
    this.serviceDesk.waitingCustomers.push( this.customer);
    // update statistics
    sim.stat.arrivedCustomers++;
    if (this.serviceDesk.waitingCustomers.length > sim.stat.maxQueueLength) {
      sim.stat.maxQueueLength = this.serviceDesk.waitingCustomers.length;
    }
    // if the service desk is not busy
    if (this.serviceDesk.waitingCustomers.length === 1) {
      followupEvents.push( new CustomerDeparture({
        delay: ServiceDesk.serviceDuration(),
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
    return math.getUniformRandomNumber( 1, 6);
  }
}
