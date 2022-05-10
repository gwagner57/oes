class DriveForkliftToArrivalArea extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  static duration() {return rand.triangular( 0.5*DriveForkliftToArrivalArea.meanTime,
      2*DriveForkliftToArrivalArea.meanTime, DriveForkliftToArrivalArea.meanTime);}
}
DriveForkliftToArrivalArea.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
DriveForkliftToArrivalArea.PERFORMER = "operator";

DriveForkliftToArrivalArea.meanTime = sim.model.p.distanceForkliftHomeToArrivalArea /
    sim.model.p.forkliftSpeed / 60;  // in min
DriveForkliftToArrivalArea.successorNode = "LoadProduct";

DriveForkliftToArrivalArea.labels = {"className":"DriveFlToArrival"};
