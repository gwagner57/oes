class CustomerArrival extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  createNextEvent() {
    return new CustomerArrival({
      delay: CustomerArrival.recurrence()
    });
  }
  static recurrence() {
    return rand.exponential( 0.3);
  }
}
CustomerArrival.successorNode = "Service";
