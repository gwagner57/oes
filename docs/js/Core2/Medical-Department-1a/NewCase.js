class NewCase extends eVENT {
  constructor({ occTime, delay, medicalDepartment}) {
    super({occTime, delay});
    // if no med.dep. specified, use object with ID 1
    this.medicalDepartment = medicalDepartment || sim.objects.get(1);
  }
  onEvent() {
    const followupEvents=[],
          medDep = this.medicalDepartment;
    // update statistics
    sim.stat.arrivedPatients++;
    if (medDep.plannedExaminations.length > sim.stat.maxQueueLength) {
      sim.stat.maxQueueLength = medDep.plannedExaminations.length;
    }
    if (medDep.isDoctorAvailable()) {
      // allocate resources
      medDep.allocateDoctor();
      // start next examination
      followupEvents.push( new aCTIVITYsTART({
        plannedActivity: new Examination({medicalDepartment: medDep})
      }));
    } else {  // queue up next planned examination
      medDep.plannedExaminations.push( new Examination());
    }
    return followupEvents;
  }
  createNextEvent() {
    return new NewCase({
      medicalDepartment: this.medicalDepartment
    });
  }
  static recurrence() {
    return rand.exponential( 0.3);
  }
}
