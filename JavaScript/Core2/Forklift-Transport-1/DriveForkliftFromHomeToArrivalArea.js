class DriveForkliftFromHomeToArrivalArea extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  static duration() {return rand.triangular( 0.5*DriveForkliftFromHomeToArrivalArea.meanTime,
      2*DriveForkliftFromHomeToArrivalArea.meanTime, DriveForkliftFromHomeToArrivalArea.meanTime);}
}
DriveForkliftFromHomeToArrivalArea.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
DriveForkliftFromHomeToArrivalArea.PERFORMER = "operator";

DriveForkliftFromHomeToArrivalArea.meanTime = sim.model.p.distanceForkliftHomeToArrivalArea /
    sim.model.p.forkliftSpeed / 60;  // in min
DriveForkliftFromHomeToArrivalArea.successorNode = "LoadProduct";
