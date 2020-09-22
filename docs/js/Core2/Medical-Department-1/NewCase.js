class NewCase extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  onEvent() {
    var followupEvents=[];
    // Enqueue a new planned examination (of the newly arrived patient)
    Examination.plannedActivities.enqueue( new Examination());
    return followupEvents;
  }
  createNextEvent() {
    return new NewCase({delay: NewCase.recurrence()});
  }
  static recurrence() {
    return rand.exponential( 0.8);
  }
}
