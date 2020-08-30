class Service extends aCTIVITY {
  constructor({id, startTime, duration, serviceDesk}) {
    super({id, startTime, duration});
    this.serviceDesk = serviceDesk;
  }
  onActivityStart() {
    this.serviceDesk.status = oes.ResourceStatusEL.BUSY;
    return [];
  }
  onActivityEnd() {
    var followupEvents = [], plannedServices = this.serviceDesk.plannedServices;
    // update statistics
    sim.stat.departedCustomers++;
    // if there are still customers waiting
    if (plannedServices.length > 0) {
      // start next service
      followupEvents.push( new aCTIVITYsTART({
        plannedActivity: plannedServices.shift(),  // dequeue next planned service
      }));
    } else this.serviceDesk.status = oes.ResourceStatusEL.AVAILABLE;
    return followupEvents;
  }
  static duration() {return rand.uniform( 1, 4);}
}
// A service requires a service desk. There is no pool of service desks.
Service.resourceRoles = {"serviceDesk": {range: ServiceDesk, card:1}, "PERFORMER":"serviceDesk"}