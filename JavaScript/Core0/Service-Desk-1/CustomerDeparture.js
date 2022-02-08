class CustomerDeparture extends eVENT {
  constructor({ occTime, delay, serviceDesk}) {
    super({ occTime, delay});
    this.serviceDesk = serviceDesk;
  }
  onEvent() {
    var followupEvents=[];
    // decrement queue length due to departure
    this.serviceDesk.queueLength--;
    // update statistics
    sim.stat.departedCustomers++;
    // if there are still customers waiting
    if (this.serviceDesk.queueLength > 0) {
      // start next service and schedule its end/departure
      followupEvents.push( new CustomerDeparture({
        delay: ServiceDesk.serviceTime(),
        serviceDesk: this.serviceDesk
      }));
    }
    return followupEvents;
  }
}
