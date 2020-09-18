class Examination extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  onActivityEnd() {
    var followupEvents = [];
    /*
    sim.resourcePools["rooms"].release();
    sim.resourcePools["doctors"].release();
    // if there are still planned exams (waiting patients)
    if (Examination.plannedActivities.length > 0 &&
        sim.resourcePools["rooms"].isAvailable() &&
        sim.resourcePools["doctors"].isAvailable()) {
      // allocate resources
      sim.resourcePools["rooms"].allocate();
      sim.resourcePools["doctors"].allocate();
      // start next exam
      followupEvents.push( new aCTIVITYsTART({
        plannedActivity: Examination.plannedActivities.dequeue(),
        //resourceRoles: {"serviceDesk": this.serviceDesk}
      }));
    }
    */
    return followupEvents;
  }
  static duration() {return rand.uniform( 5, 9);}
}
// An examination requires a room and a doctor
Examination.resourceRoles = {
    "doctor": {countPoolName:"doctors", card:1}
}
Examination.PERFORMER = "doctor";