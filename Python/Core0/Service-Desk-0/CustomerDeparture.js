class CustomerDeparture extends eVENT {
  constructor({occTime, delay}) {
    super({occTime, delay});
  }
  onEvent() {
    var followupEvents=[];
    // decrement queue length due to departure
    sim.model.v.queueLength--;
    // update statistics
    sim.stat.departedCustomers++;
    // if there are still customers waiting
    if (sim.model.v.queueLength > 0) {
      // start next service and schedule its end/departure
      followupEvents.push( new CustomerDeparture({
        delay: sim.model.f.serviceTime()
      }));
    }
    return followupEvents;
  }
}
