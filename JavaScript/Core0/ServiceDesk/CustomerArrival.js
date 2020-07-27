class CustomerArrival extends eVENT {
  constructor({ occTime, serviceDesk}) {
    super(occTime);
    this.serviceDesk = serviceDesk;
    this.customer = null;  // is assigned on occurrence
  }
  onEvent() {
    var srvTm=0, followupEvents=[];
    // create new customer object
    this.customer = new Customer({arrivalTime: this.occTime});
    // push new customer to the queue
    this.serviceDesk.waitingCustomers.push( this.customer);
    // update statistics
    sim.stat.arrivedCustomers++;
    // if the service desk is not busy
    if (this.serviceDesk.waitingCustomers.length === 1) {
      srvTm = ServiceDesk.serviceDuration();
      followupEvents.push( new CustomerDeparture({
        occTime: this.occTime + srvTm,
        serviceDesk: this.serviceDesk
      }));
    }
    return followupEvents;
  }
  createNextEvent() {
    return new CustomerArrival({
      occTime: this.occTime + CustomerArrival.recurrence(),
      serviceDesk: this.serviceDesk
    });
  }
  static recurrence() {
    return math.getUniformRandomNumber( 1, 6);
  }
}
