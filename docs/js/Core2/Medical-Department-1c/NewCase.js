class NewCase extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  onEvent() {
    var followupEvents=[];
    return followupEvents;
  }
  createNextEvent() {
    return new NewCase({delay: NewCase.recurrence()});
  }
  static recurrence() {
    return rand.exponential( 0.3);
  }
}
// Enqueue a new planned examination (of the newly arrived patient)
NewCase.successorActivity = "Examination";
// = Examination.tasks.enqueue( new Examination());
