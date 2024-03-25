class EndOfWeek extends tIMEeVENT {
  constructor({occTime, delay} = {}) {
    super({occTime, delay});
  }
  static recurrence() {
    return 7;  // each week
  }
}

