class NewCase extends eVENT {
  constructor({ occTime, delay, medicalDepartment}) {
    super({occTime, delay});
    this.medicalDepartment = medicalDepartment;
  }
  onEvent() {
    var followupEvents=[], medDep = this.medicalDepartment;
    medDep.plannedExaminations.push( new Examination({medicalDepartment: medDep}));
    // update statistics
    sim.stat.arrivedPatients++;
    if (medDep.plannedExaminations.length > sim.stat.maxQueueLength) {
      sim.stat.maxQueueLength = medDep.plannedExaminations.length;
    }
    if (medDep.isDoctorAvailable()) {
      // allocate resources
      medDep.allocateDoctor();
      // start next exam
      followupEvents.push( new aCTIVITYsTART({
          plannedActivity: medDep.plannedExaminations.shift()  // dequeue next planned exam
      }));
    }
    return followupEvents;
  }
  createNextEvent() {
    return new NewCase({
      delay: NewCase.recurrence(),
      medicalDepartment: this.medicalDepartment
    });
  }
  static recurrence() {
    return rand.exponential( 0.7);
  }
}
