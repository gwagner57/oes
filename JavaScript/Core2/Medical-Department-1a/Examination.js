class Examination extends aCTIVITY {
  constructor({id, startTime, duration, medicalDepartment}={}) {
    super({id, startTime, duration});
    this.medicalDepartment = medicalDepartment;
  }
  onActivityEnd() {
    var followupEvents = [],
        medDep = this.medicalDepartment,
        plannedExams = medDep.plannedExaminations;
    // update statistics
    sim.stat.departedPatients++;
    // if there are still planned examinations (waiting patients)
    if (plannedExams.length > 0) {
      // dequeue next planned exam;
      let plannedExam = plannedExams.shift();
      // start next examination at the same department
      plannedExam.medicalDepartment = medDep;
      followupEvents.push( new aCTIVITYsTART({plannedActivity: plannedExam}));
    } else {
      medDep.releaseDoctor();
    }
    return followupEvents;
  }
}
Examination.duration = function () {
  return rand.uniform(5,10);
};
