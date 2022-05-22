class ProductArrival extends eVENT {
  constructor({occTime, delay}={}) {
    super({occTime, delay});
    this.productType = rand.frequency({"1": ProductArrival.freq1, "2": ProductArrival.freq2, "3": ProductArrival.freq3});
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
    // try allocating FL+op by preemption of DriveForkliftHome activities
    if (!product.isAssigned) {
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
          // schedule the preemption successor activity
          followupEvents.push( aCTIVITY.preempt( acty, DriveForkliftBackToArrivalArea));
          break;
        }
      }
      // try allocating a suitable operator by preemption of WalkBackHome activities
      if (!product.isAssigned && suitableForklifts.length > 0) {
        const preemptionCandidates = ongoingActivities.filter(
                  acty => acty.constructor === WalkBackHome);
        outer:for (const fl of suitableForklifts) {
          for (const acty of preemptionCandidates) {
            if (Operator.canTakeForkliftTypes[acty.operator.type].includes( fl.type)) {
              acty.operator.assignedProduct = product;
              product.isAssigned = true;
              // allocate the chosen forklift
              resPools["forklifts"].allocateById( fl.id);
              // the preempt method will transfer the operator resource to succActy
              const succActy = aCTIVITY.preempt( acty, new WalkToForklift({forklift: fl}));
              // schedule the preemption successor activity
              followupEvents.push( succActy);
              break outer;
            }
          }
        }
      }
    }
    return followupEvents;
  }
}
ProductArrival.eventRatePerHour = sim.model.p.arrivalRatePerHourType1 + sim.model.p.arrivalRatePerHourType2 +
    sim.model.p.arrivalRatePerHourType3;
ProductArrival.eventRate = ProductArrival.eventRatePerHour / 60;  // rate per minute
ProductArrival.freq1 = sim.model.p.arrivalRatePerHourType1 / ProductArrival.eventRatePerHour;
ProductArrival.freq2 = sim.model.p.arrivalRatePerHourType2 / ProductArrival.eventRatePerHour;
ProductArrival.freq3 = sim.model.p.arrivalRatePerHourType3 / ProductArrival.eventRatePerHour;

