class GoToLoadingSite extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.triangular( 30, 50, 40);}
}
// An GoToLoadingSite activity requires a truck
GoToLoadingSite.resourceRoles = {
  "truck": {range: Truck}
}
GoToLoadingSite.PERFORMER = "truck";
GoToLoadingSite.successorNode = "Load";
