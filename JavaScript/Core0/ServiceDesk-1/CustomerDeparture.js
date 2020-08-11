class CustomerDeparture extends eVENT {
  constructor({ occTime, serviceDesk}) {
    super(occTime);
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
        occTime: this.occTime + ServiceDesk.serviceTime(),
        serviceDesk: this.serviceDesk
      }));
    }
    return followupEvents;
  }
}
