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
    if (!product.isAssigned) {  // try allocating FL+op by preemption
      const ongoingActivities = Object.keys( sim.ongoingActivities).map(
                actID => sim.ongoingActivities[actID]),
            preemptionCandidates = ongoingActivities.filter(
                acty => acty.constructor === DriveForkliftHome);
      for (const acty of preemptionCandidates) {
        if (Forklift.canTakeProductTypes[acty.forklift.type].includes( this.productType)) {
          // preempt this DriveForkliftHome activity and reallocate its resources to
          // a newly scheduled DriveForkliftFromHomeToArrivalArea activity
          acty.operator.assignedProduct = product;
          product.isAssigned = true;
          // aCTIVITY.preempt( acty, DriveForkliftFromHomeToArrivalArea, PreemptionModeEL.QUIT)
        }
      }
      // WalkBackHome
    }
    return followupEvents;
  }
}
ProductArrival.eventRate = sim.model.p.arrivalRatePerHour / 60;  // rate per minute
