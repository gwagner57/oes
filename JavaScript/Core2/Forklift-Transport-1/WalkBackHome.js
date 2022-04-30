class WalkBackHome extends aCTIVITY {
  constructor({id, startTime, duration, operator}={}) {
    super({id, startTime, duration});
    this.operator = operator;
  }
  static duration() {return rand.triangular( 1, 3, 1.5);}

  onActivityEnd() {
    const followupEvents = [];
    //TODO: check if suitable product is waiting
    // de-allocate operator
    sim.scenario.resourcePools["operators"].release( this.operator);
    return followupEvents;
  }
}
WalkBackHome.resourceRoles = {
  "operator": {range: Operator}
}
WalkBackHome.PERFORMER = "operator";