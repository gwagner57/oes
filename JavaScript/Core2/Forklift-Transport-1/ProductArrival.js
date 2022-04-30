class ProductArrival extends eVENT {
  constructor({occTime, delay}={}) {
    super({occTime, delay});
    // product type is 1 in 10/60, 2 in 20/60 and 3 in 30/60 of all arrivals per hour
    this.productType = rand.frequency({"1":1/6, "2":1/3, "3":1/2});
  }
  onEvent() {
    const followupEvents = [];
    const resPools = sim.scenario.resourcePools,
        availForklifts = resPools["forklifts"].availResources,
        suitableForklifts = availForklifts.filter( (fl) =>
            Forklift.canTakeProductTypes[fl.type].includes( this.productType)),
        availOperators = resPools["operators"].availResources,
        product = new Product({type: this.productType, arrivalTime: this.occTime});
    sim.namedObjects.get("arrivalArea").productBuffer.addProduct( product);
    outer:for (const op of availOperators) {
      for (const fl of suitableForklifts) {
        if (Operator.canTakeForkliftTypes[op.type].includes( fl.type)) {
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
ProductArrival.eventRate = 60/60; // 60 product arrivals per hour
