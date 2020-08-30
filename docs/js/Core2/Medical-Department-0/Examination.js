class Examination extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  onActivityEnd() {
    var followupEvents = [], plannedExams = Examination.plannedActivities;
    sim.resourcePools["rooms"].release();
    sim.resourcePools["doctors"].release();
    // update statistics
    sim.stat.departedPatients++;
    // if there are still planned exams (waiting patients)
    if (plannedExams.length > 0 &&
        sim.resourcePools["rooms"].isAvailable() &&
        sim.resourcePools["doctors"].isAvailable()) {
      // allocate resources
      sim.resourcePools["rooms"].allocate();
      sim.resourcePools["doctors"].allocate();
      // start next exam
      followupEvents.push( new aCTIVITYsTART({
        plannedActivity: plannedExams.shift(),  // dequeue next planned exam
        //resourceRoles: {"serviceDesk": this.serviceDesk}
      }));
    }
    return followupEvents;
  }
  static duration() {return rand.uniform( 5, 9);}
}
// The queue of planned examinations
Examination.plannedActivities = [];
// An examination requires a room and a doctor
Examination.resourceRoles = {
    "room": {pool:"rooms", card:1},
    "doctor": {pool:"doctors", card:1},
    "PERFORMER": "doctor"
}