class NewCase extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  onEvent() {
    var followupEvents=[];
    // Enqueue a new planned examination (of the newly arrived patient)
    Examination.plannedActivities.enqueue( new Examination());
    /*
    // if the required resources for an examination are available
    if (sim.resourcePools["rooms"].isAvailable() &&
        sim.resourcePools["doctors"].isAvailable()) {
      // allocate resources
      sim.resourcePools["rooms"].allocate();
      sim.resourcePools["doctors"].allocate();
      // start next exam
      followupEvents.push( new aCTIVITYsTART({
          plannedActivity: Examination.plannedActivities.dequeue()
      }));
    }
    */
    return followupEvents;
  }
  createNextEvent() {
    return new NewCase({delay: NewCase.recurrence()});
  }
  static recurrence() {
    return rand.exponential( 0.8);
  }
}
