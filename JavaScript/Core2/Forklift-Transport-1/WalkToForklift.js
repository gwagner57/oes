class WalkToForklift extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  static duration() {return rand.triangular( 1, 3, 1.5);}
/*
  onActivityEnd() {
    const followupEvents = [];
    // start DriveForkliftFromHomeToArrivalArea activity
    followupEvents.push( new aCTIVITYsTART({
      plannedActivity: new DriveForkliftFromHomeToArrivalArea({ operator: this.operator,
        forklift: this.forklift, product: this.product})
    }));
    return followupEvents;
  }
*/
}
WalkToForklift.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
WalkToForklift.PERFORMER = "operator";
WalkToForklift.successorNode = "DriveForkliftFromHomeToArrivalArea";
