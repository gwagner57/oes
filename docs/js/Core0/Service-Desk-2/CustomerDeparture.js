class CustomerDeparture extends eVENT {
  constructor({ occTime, delay, serviceDesk}) {
    super({occTime, delay});
    this.serviceDesk = serviceDesk;
  }
  onEvent() {
    var followupEvents=[];
    // remove/pop customer from FIFO queue (FIFO pop = JS shift)
    var departingCustomer = this.serviceDesk.waitingCustomers.shift();
    // add the time the customer has spent in the system
    sim.stat.cumulativeTimeInSystem += this.occTime - departingCustomer.arrivalTime;
    // remove customer from map of simulation objects
    sim.objects.delete( departingCustomer.id);
    // update statistics
    sim.stat.departedCustomers++;
    // if there are still customers waiting
    if (this.serviceDesk.waitingCustomers.length > 0) {
      // start next service and schedule its end/departure
      followupEvents.push( new CustomerDeparture({
        delay: ServiceDesk.serviceDuration(),
        serviceDesk: this.serviceDesk
      }));
    }
    return followupEvents;
  }
}
