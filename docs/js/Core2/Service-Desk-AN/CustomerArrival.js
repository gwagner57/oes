class CustomerArrival extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  static recurrence() {
    return rand.exponential( 0.3);
  }
}
CustomerArrival.successorNode = "Service";
