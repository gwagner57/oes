class DriveForkliftFromHomeToArrivalArea extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  // driving a distance of 300 m with 2 m/s
  static duration() {return rand.triangular( 2.5, 4, 3);}
}
DriveForkliftFromHomeToArrivalArea.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
DriveForkliftFromHomeToArrivalArea.PERFORMER = "operator";
DriveForkliftFromHomeToArrivalArea.successorNode = "LoadProduct";
