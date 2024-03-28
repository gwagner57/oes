class StartOfDay extends tIMEeVENT {
  constructor({occTime, delay} = {}) {
    super({occTime, delay});
  }
  static recurrence() {
    return 24 * 60;  // each day
  }
}

