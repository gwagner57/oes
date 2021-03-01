class OrderCall extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  createNextEvent() {
    return new OrderCall({delay: OrderCall.recurrence()});
  }
  static recurrence() {
    var hour = Math.floor(sim.time / 60);
    return rand.exponential( OrderCall.arrivalRates[hour]);
  }
}
OrderCall.successorActivity = "TakeOrder";
// arrival rates per minute (for a daily operation for 5 hours)
OrderCall.arrivalRates = [1/6, 1.5, 1/1.5, 1/6, 1/12]; // = 10, 90, 40, 10, 5 per hour
