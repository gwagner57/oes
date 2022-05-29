class WalkBackHome extends aCTIVITY {
  constructor({id, startTime, duration, operator}={}) {
    super({id, startTime, duration});
    this.operator = operator;
  }
  static duration() {return rand.triangular( 0.5*WalkBackHome.meanTime,
      2*WalkBackHome.meanTime, WalkBackHome.meanTime);}

  onActivityEnd() {
    const followupEvents = [];
    const availableForklifts = sim.scenario.resourcePools["forklifts"].availResources;
    let product=null;
    // check if there are suitable products waiting
    for (const fl of availableForklifts) {
      if (!this.operator.type.canDriveForkliftTypes.includes( fl.id)) continue;
      product = sim.namedObjects.get("arrivalArea").productBuffer.getUnassignedProductByType(
          fl.type.canTakeProductTypes);
      if (product) {
        this.operator.assignedProduct = product;
        product.isAssigned = true;
        // allocate forklift
        sim.scenario.resourcePools["forklifts"].allocateById( fl.id);
        // start WalkToForklift activity
        followupEvents.push( new aCTIVITYsTART({
            plannedActivity: new WalkToForklift({ operator: this.operator, forklift: fl})}));
        // record operator as transferred/re-allocated resource for preventing its automated
        // de-allocation in the aCTIVITYeND event routine
        this.namesOfTransferredResRoles = ["operator"];
        break;
      }
    }
    return followupEvents;
  }
}
WalkBackHome.resourceRoles = {
  "operator": {range: Operator}
}
WalkBackHome.PERFORMER = "operator";
/************************************************************
 * The following conditional activity scheduling cannot be used for the
 * WalkBackHome logic because it does not allow an advance allocation
 * of a forklift/operator combination.

WalkBackHome.successorNodeNames = {
  "WalkToForklift": acty => !!acty.operator.assignedProduct
}
*/
WalkBackHome.meanTime = sim.model.p.distanceOperatorHomeToForkliftHome /
    sim.model.p.operatorSpeed / 60;  // in min
