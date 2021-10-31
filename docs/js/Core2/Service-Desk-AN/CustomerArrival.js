class CustomerArrival extends eVENT {
  constructor({ occTime, delay}={}) {
    super({occTime, delay});
  }
}
CustomerArrival.eventRate = 0.3;
CustomerArrival.successorNode = "Service";
