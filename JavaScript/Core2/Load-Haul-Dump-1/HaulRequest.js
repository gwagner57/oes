class HaulRequest extends eVENT {
  constructor({ occTime, delay, quantity}) {
    super({occTime, delay});
    this.quantity = quantity;
  }
  onEvent() {
    const followupEvents=[],
          allocatedTrucks = sim.scenario.resourcePools["trucks"].allocateAll();
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
}
