class HaulServiceRequest extends eVENT {
  constructor({ occTime, delay, quantity}) {
    super({occTime, delay});
    this.quantity = quantity;
  }
  onEvent() {
    const followupEvents=[],
          allocatedTrucks = sim.resourcePools["trucks"].allocateAll();
    sim.model.v.nmrOfLoads = Math.ceil( this.quantity / Truck.capacity);
    for (const t of allocatedTrucks) {
      const goActy = new GoToLoadingSite();
      // assign required resource
      goActy.truck = t;
      // start GoToLoadingSite activity
      followupEvents.push( new aCTIVITYsTART({plannedActivity: goActy}));
    }
    return followupEvents;
  }
/*
  createNextEvent() {
    return new HaulServiceRequest({delay: HaulServiceRequest.recurrence()});
  }
  static recurrence() {
    return rand.exponential( 0.3);
  }
*/
}
