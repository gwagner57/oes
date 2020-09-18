class Examination extends aCTIVITY {
  constructor({id, startTime, duration, medicalDepartment}) {
    super({id, startTime, duration});
    this.medicalDepartment = medicalDepartment;
  }
  onActivityEnd() {
    var followupEvents = [], medDep = this.medicalDepartment,
        plannedExams = medDep.plannedExaminations;
    medDep.releaseDoctor();
    // update statistics
    sim.stat.departedPatients++;
    // if there are still planned exams (waiting patients)
    if (plannedExams.length > 0 && medDep.isDoctorAvailable()) {
      // allocate resources
      medDep.allocateDoctor();
      // start next exam
      followupEvents.push( new aCTIVITYsTART({
        plannedActivity: plannedExams.shift()  // dequeue next planned exam
      }));
    }
    return followupEvents;
  }
}
Examination.duration = function () {
  return rand.uniform(5,9);
};
