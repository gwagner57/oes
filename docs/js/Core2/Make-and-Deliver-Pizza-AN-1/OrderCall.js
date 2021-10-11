class OrderCall extends eVENT {
  constructor({occTime, delay}={}) {
    super({occTime, delay});
  }
}
OrderCall.successorNode = "TakeOrder";
OrderCall.eventRate = 0.5;
