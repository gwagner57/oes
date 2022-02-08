class Dump extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.triangular( 5, 25, 15);}
}
// An examination requires a doctor, two nurses and a room
Dump.resourceRoles = {
  "truck": {range: Truck}
}
Dump.PERFORMER = "truck";
Dump.successorNode = function () {
  return sim.model.v.nmrOfLoads > 0 ? "GoBackToLoadingSite":"GoHome";
}
