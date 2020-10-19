class Request extends eVENT {
  constructor({ occTime, delay, quantity}) {
    super({occTime, delay});
    this.quantity = quantity;
  }
  onEvent() {
    const followupEvents=[],
          nmrOfAvailTrucks = sim.resourcePools["trucks"].availResources.length,
          allocatedTrucks = sim.resourcePools["trucks"].allocate( nmrOfAvailTrucks),
          truckCapacity = 15;  // m3
    sim.model.v.nmrOfLoads = this.quantity / truckCapacity;
    for (const t of allocatedTrucks) {
      const goActy = new GoToLoadingSite();
      goActy.truck = t;
      // start next activity with the allocated resources
      followupEvents.push( new aCTIVITYsTART({plannedActivity: goActy}));
    }
    return followupEvents;
  }
/*
  createNextEvent() {
    return new Request({delay: Request.recurrence()});
  }
  static recurrence() {
    return rand.exponential( 0.3);
  }
*/
}
