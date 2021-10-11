class NewCase extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  createNextEvent() {
    return new NewCase({delay: NewCase.recurrence()});
  }
  static recurrence() {
    return rand.exponential( 0.3);
  }
}
/*******************************************************
 *** Process Model Items *******************************
 *******************************************************/
// Enqueue a new planned walk
NewCase.successorNode = "WalkToRoom";
