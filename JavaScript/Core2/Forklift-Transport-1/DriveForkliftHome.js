class DriveForkliftHome extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  static duration() {return rand.triangular( 0.5*DriveForkliftHome.meanTime,
      2*DriveForkliftHome.meanTime, DriveForkliftHome.meanTime);}

  onActivityEnd() {
    const followupEvents = [];
    const availableForklifts = sim.scenario.resourcePools["forklifts"].availResources;
    // check if there are suitable products waiting
    let product = sim.namedObjects.get("arrivalArea").productBuffer.getUnassignedProductByType(
        Forklift.canTakeProductTypes[this.forklift.type]);
    if (!product) {
      // check if there are other suitable forklifts for waiting products
      for (const fl of availableForklifts) {
        product = sim.namedObjects.get("arrivalArea").productBuffer.getUnassignedProductByType(
            Forklift.canTakeProductTypes[fl.type]);
        if (product) {
          // de-allocate current forklift
          sim.scenario.resourcePools["forklifts"].release( this.forklift);
          // allocate new forklift
          sim.scenario.resourcePools["forklifts"].allocateById( fl.id);
          // a trick for passing the forklift to next activity DriveForkliftFromHomeToArrivalArea
          this.forklift = fl;
          break;
        }
      }
    }
    if (product) {
      this.operator.assignedProduct = product;
      product.isAssigned = true;
    }
    return followupEvents;
  }
}
DriveForkliftHome.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
DriveForkliftHome.PERFORMER = "operator";

DriveForkliftHome.meanTime = sim.model.p.distanceDestinationAreaToForkliftHome /
    sim.model.p.forkliftSpeed / 60;  // in min
DriveForkliftHome.successorNode = acty => acty.operator.assignedProduct ?
    "DriveForkliftToArrivalArea" : "WalkBackHome";
