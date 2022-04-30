class DriveForkliftHome extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  // driving a distance of 300 m with 2 m/s
  static duration() {return rand.triangular( 2.5, 4, 3);}

  onActivityEnd() {
    const followupEvents = [];
    const availableForklifts = sim.scenario.resourcePools["forklifts"].availResources;
    let forklift = this.forklift;
    // check if there are suitable products waiting
    let product = sim.namedObjects.get("arrivalArea").productBuffer.getUnassignedProductByType(
        Forklift.canTakeProductTypes[this.forklift.type]);
    if (!product) {
      // de-allocate forklift
      sim.scenario.resourcePools["forklifts"].release( this.forklift);
      // check if there are other suitable forklifts for waiting products
      for (const fl of availableForklifts) {
        product = sim.namedObjects.get("arrivalArea").productBuffer.getUnassignedProductByType(
            Forklift.canTakeProductTypes[fl.type]);
        if (product) {
          // allocate new forklift
          sim.scenario.resourcePools["forklifts"].allocateById( fl.id);
          forklift = fl;
          break;
        }
      }
    }
    if (product) {
      this.operator.assignedProduct = product;
      product.isAssigned = true;
      // drive forklift to arrival area
      followupEvents.push( new aCTIVITYsTART({
        plannedActivity: new DriveForkliftFromHomeToArrivalArea({ operator: this.operator,
          forklift})
      }));
    } else {  // walk back home
      followupEvents.push( new aCTIVITYsTART({
        plannedActivity: new WalkBackHome({ operator: this.operator})
      }));
    }
    return followupEvents;
  }
}
DriveForkliftHome.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
DriveForkliftHome.PERFORMER = "operator";