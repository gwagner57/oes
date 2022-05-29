class WalkBackHome extends aCTIVITY {
  constructor({id, startTime, duration, operator}={}) {
    super({id, startTime, duration});
    this.operator = operator;
  }
  static duration() {return rand.triangular( 0.5*WalkBackHome.meanTime,
      2*WalkBackHome.meanTime, WalkBackHome.meanTime);}
}
WalkBackHome.resourceRoles = {
  "operator": {range: Operator}
}
WalkBackHome.PERFORMER = "operator";

WalkBackHome.meanTime = sim.model.p.distanceOperatorHomeToForkliftHome /
    sim.model.p.operatorSpeed / 60;  // in min
