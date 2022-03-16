class EndOfWeek extends tIMEeVENT {
  constructor({occTime, delay} = {}) {
    super({occTime, delay, type:"EndOfWeek"});
  }
  static recurrence() {
    return 7;  // each week
  }
}

