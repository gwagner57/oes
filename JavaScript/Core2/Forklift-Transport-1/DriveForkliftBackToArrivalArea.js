class DriveForkliftBackToArrivalArea extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  // driving a distance of 600 m with 2 m/s
  static duration() {return rand.triangular( 5, 7, 5.5);}
}
DriveForkliftBackToArrivalArea.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
DriveForkliftBackToArrivalArea.PERFORMER = "operator";
DriveForkliftBackToArrivalArea.successorNode = "LoadProduct";
