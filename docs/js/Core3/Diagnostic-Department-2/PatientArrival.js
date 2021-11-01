class PatientArrival extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  createNextEvent() {
    return new PatientArrival({delay: PatientArrival.recurrence()});
  }
  static recurrence() {
    return rand.exponential( 0.3);
  }
}
/*******************************************************
 *** Process Model Items *******************************
 *******************************************************/
// Enqueue a new planned walk
PatientArrival.successorNode = "WalkToRoom";
