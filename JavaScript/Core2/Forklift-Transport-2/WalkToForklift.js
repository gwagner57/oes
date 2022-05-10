class WalkToForklift extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  static duration() {return rand.triangular( 0.5*WalkToForklift.meanTime,
      2*WalkToForklift.meanTime, WalkToForklift.meanTime);}
}
WalkToForklift.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
WalkToForklift.PERFORMER = "operator";

WalkToForklift.meanTime = sim.model.p.distanceOperatorHomeToForkliftHome /
    sim.model.p.operatorSpeed / 60;  // in min
WalkToForklift.successorNode = "DriveForkliftToArrivalArea";
