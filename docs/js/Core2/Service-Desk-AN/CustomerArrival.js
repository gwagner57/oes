class CustomerArrival extends eVENT {
  constructor({ occTime, delay, serviceDesk}) {
    super({occTime, delay});
    this.serviceDesk = serviceDesk;
  }
  onEvent() {
    var followupEvents=[], plannedServices = Service.tasks;
    // Enqueue a new planned service (for the newly arrived customer) at the arrival event's service desk
    plannedServices.startOrEnqueue( new Service());
    // if the service desk is not busy
    if (this.serviceDesk.status === rESOURCEsTATUS.AVAILABLE) {
      followupEvents.push( new aCTIVITYsTART({
        plannedActivity: plannedServices.dequeue(),  // dequeue next planned service
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
