class Service extends aCTIVITY {
  constructor({id, startTime, duration, serviceDesk}={}) {
    super({id, startTime, duration});
  }
  /*
  onActivityStart() {return [];}
  */
  onActivityEnd() {
    const followupEvents=[];
    // update statistics
    sim.stat.departedCustomers++;
    return followupEvents;
  }
  static duration() {return rand.uniform( 1, 4);}
}
// A service requires a service desk.
Service.resourceRoles = {
  "serviceDesk": {range: ServiceDesk, card:1}
}
Service.PERFORMER = "serviceDesk";