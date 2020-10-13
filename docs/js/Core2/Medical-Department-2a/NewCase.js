class NewCase extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  onEvent() {return [];}
  createNextEvent() {
    return new NewCase({delay: NewCase.recurrence()});
  }
  static recurrence() {
    return rand.exponential( 0.3);
  }
}
// Enqueue a new planned walk
NewCase.successorActivity = "WalkToRoom";
