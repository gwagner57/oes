class GoBackToLoadingSite extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.triangular( 30, 50, 40);}
}
// An examination requires a doctor, two nurses and a room
GoBackToLoadingSite.resourceRoles = {
  "truck": {range: Truck}
}
GoBackToLoadingSite.PERFORMER = "truck";

GoBackToLoadingSite.successorNode = "Load";
/***** Variant 2: Prevent empty Load-Haul-Dump sequences
GoBackToLoadingSite.successorNode = function () {
  return sim.model.v.nmrOfLoads > 0 ? "Load":"GoHome";
}
*/
