class ProductArrival extends eVENT {
  constructor({occTime, delay}={}) {
    super({occTime, delay});
    this.productTypeId = rand.frequency( sim.model.p.prodTypeFrequencyMap);
  }
  onEvent() {
    const followupEvents = [];
    const resPools = sim.scenario.resourcePools,
          availForklifts = resPools["forklifts"].availResources,
          suitableForklifts = availForklifts.filter( (fl) =>
              fl.type.canTakeProductTypes.includes( this.productTypeId)),
          availOperators = resPools["operators"].availResources,
          product = new Product({type: this.productTypeId, arrivalTime: this.occTime});
    sim.namedObjects.get("arrivalArea").productBuffer.addProduct( product);
    outer:for (const op of availOperators) {
      for (const fl of suitableForklifts) {
        if (op.type.canDriveForkliftTypes.includes( fl.type.id)) {
          op.assignedProduct = product;
          product.isAssigned = true;
          // allocate the chosen forklift
          resPools["forklifts"].allocateById( fl.id);
          // allocate the chosen operator
          resPools["operators"].allocateById( op.id);
          // start WalkToForklift activity
          followupEvents.push( new aCTIVITYsTART({
              plannedActivity: new WalkToForklift({ operator: op, forklift: fl})}));
          break outer;
        }
      }
    }
    return followupEvents;
  }
}
ProductArrival.labels = {"className":"Arr", "productTypeId":"type"};