class CustomerArrival extends eVENT {
  constructor({ occTime, delay, serviceDesk}) {
    super({occTime, delay});
    this.serviceDesk = serviceDesk;
  }
  onEvent() {
    var followupEvents=[];
    this.serviceDesk.queueLength++;
    // update statistics
    sim.stat.arrivedCustomers++;
    if (this.serviceDesk.queueLength > sim.stat.maxQueueLength) {
      sim.stat.maxQueueLength = this.serviceDesk.queueLength;
    }
    // if the service desk is not busy
    if (this.serviceDesk.queueLength === 1) {
      followupEvents.push( new aCTIVITYsTART({
        activityType: PerformService,
        // on activity creation, resource roles are copied to corresp. property slots
        resourceRoles: {"serviceDesk": this.serviceDesk}
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
