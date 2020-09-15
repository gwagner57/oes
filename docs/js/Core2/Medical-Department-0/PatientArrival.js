class PatientArrival extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  onEvent() {
    var followupEvents=[], plannedExams = Examination.plannedActivities;
    // Enqueue a new planned examination (of the newly arrived patient)
    plannedExams.enqueue( new Examination());
    // update statistics
    sim.stat.arrivedPatients++;
    /*
    // if the required resources for an examination are available
    if (sim.resourcePools["rooms"].isAvailable() &&
        sim.resourcePools["doctors"].isAvailable()) {
      // allocate resources
      sim.resourcePools["rooms"].allocate();
      sim.resourcePools["doctors"].allocate();
      // start next exam
      followupEvents.push( new aCTIVITYsTART({
          plannedActivity: plannedExams.dequeue(),  // dequeue next planned exam
      }));
    }
    */
    return followupEvents;
  }
  createNextEvent() {
    return new PatientArrival({
      delay: PatientArrival.recurrence()
    });
  }
  static recurrence() {
    return rand.exponential( 0.8);
  }
}
