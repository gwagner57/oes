class DriveForkliftBackToArrivalArea extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  static duration() {return rand.triangular( 0.5*DriveForkliftBackToArrivalArea.meanTime,
      2*DriveForkliftBackToArrivalArea.meanTime, DriveForkliftBackToArrivalArea.meanTime);}
}
DriveForkliftBackToArrivalArea.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
DriveForkliftBackToArrivalArea.PERFORMER = "operator";

DriveForkliftBackToArrivalArea.meanTime = sim.model.p.distanceArrivalToDestinationArea /
    sim.model.p.forkliftSpeed / 60;  // in min
DriveForkliftBackToArrivalArea.successorNode = "LoadProduct";

DriveForkliftBackToArrivalArea.labels = {"className":"DriveFlBacktoArrival"};