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
    return followupEvents;
  }
}
ProductArrival.eventRatePerHour = sim.model.p.arrivalRatePerHourType1 + sim.model.p.arrivalRatePerHourType2 +
    sim.model.p.arrivalRatePerHourType3;
ProductArrival.eventRate = ProductArrival.eventRatePerHour / 60;  // rate per minute
ProductArrival.freq1 = sim.model.p.arrivalRatePerHourType1 / ProductArrival.eventRatePerHour;
ProductArrival.freq2 = sim.model.p.arrivalRatePerHourType2 / ProductArrival.eventRatePerHour;
ProductArrival.freq3 = sim.model.p.arrivalRatePerHourType3 / ProductArrival.eventRatePerHour;

ProductArrival.labels = {"className":"Arr", "productType":"type"};