class Delivery extends eVENT {
  constructor({ occTime, delay, quantity, receiver}) {
    super( {occTime, delay});
    this.quantity = quantity;
    this.receiver = receiver;
  }
  onEvent() {
    this.receiver.quantityInStock += this.quantity;
    // schedule another Delivery if stock level is not raised above reorder level
    if (this.receiver.quantityInStock <= this.receiver.reorderLevel ) {
      return [new Delivery({
        delay: Delivery.leadTime(),
        quantity: this.receiver.targetInventory - this.receiver.quantityInStock,
        receiver: this.receiver
      })];
    } else return [];  // no follow-up events
  }
  static leadTime() {
    var r = math.getUniformRandomInteger( 0, 99);
    if (r < 25) return 1;         // probability 0.25
    else if (r < 85) return 2;    // probability 0.60
    else return 3;                // probability 0.15
  }
}
Delivery.labels = {"quantity":"quant"};
