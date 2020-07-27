class Delivery extends eVENT {
  constructor({ occTime, quantity, receiver}) {
    super( occTime);
    this.quantity = quantity;
    this.receiver = receiver;
  }
  onEvent() {
    this.receiver.quantityInStock += this.quantity;
    // schedule another Delivery if stock level is not raised above reorder level
    if (this.receiver.quantityInStock <= this.receiver.reorderLevel ) {
      return [new Delivery({
        occTime: this.occTime + Delivery.sampleLeadTime(),
        quantity: this.receiver.reorderUpToLevel - this.receiver.quantityInStock,
        receiver: this.receiver
      })];
    } else return [];  // no follow-up events
  }
  static sampleLeadTime() {
    var r = math.getUniformRandomInteger( 0, 99);
    if (r < 25) return 1;         // probability 0.25
    else if (r < 85) return 2;    // probability 0.60
    else return 3;                // probability 0.15
  }
}
Delivery.labels = {"quantity":"quant"};
