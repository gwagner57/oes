class DriveForkliftHome extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  static duration() {return rand.triangular( 0.5*DriveForkliftHome.meanTime,
      2*DriveForkliftHome.meanTime, DriveForkliftHome.meanTime);}
}
DriveForkliftHome.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
DriveForkliftHome.PERFORMER = "operator";

DriveForkliftHome.meanTime = sim.model.p.distanceDestinationAreaToForkliftHome /
    sim.model.p.forkliftSpeed / 60;  // in min
DriveForkliftHome.successorNode = "WalkBackHome";
