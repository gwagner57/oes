class CustomerArrival extends eVENT {
  constructor({ occTime, delay, serviceDesk}) {
    super({occTime, delay});
    this.serviceDesk = serviceDesk;
  }
  onEvent() {
    var followupEvents=[], plannedServices = this.serviceDesk.plannedServices;
    plannedServices.push( new Service({serviceDesk: this.serviceDesk}));
    // update statistics
    sim.stat.arrivedCustomers++;
    if (plannedServices.length > sim.stat.maxQueueLength) {
      sim.stat.maxQueueLength = plannedServices.length;
    }
    // if the service desk is not busy
    if (this.serviceDesk.status === oes.ResourceStatusEL.AVAILABLE) {
      followupEvents.push( new aCTIVITYsTART({
        plannedActivity: plannedServices.shift(),  // dequeue next planned service
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
    return rand.exponential( 0.3);
  }
}
