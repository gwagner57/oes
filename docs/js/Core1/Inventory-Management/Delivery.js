class Delivery extends eVENT {
  constructor({ occTime, delay, quantity, receiver}) {
    super({occTime, delay});
    this.quantity = quantity;
    this.receiver = receiver;
  }
  onEvent() {
    var followupEvents=[];
    this.receiver.stockQuantity += this.quantity;
    if (sim.model.p.reviewPolicy === "continuous") {
      // schedule another Delivery if stock level is not raised above reorder level
      if (this.receiver.stockQuantity <= this.receiver.reorderPoint ) {
        followupEvents.push( new Delivery({
          delay: Delivery.leadTime(),
          quantity: this.receiver.targetInventory - this.receiver.stockQuantity,
          receiver: this.receiver
        }));
      }
    }
    return followupEvents;
  }
  static leadTime() {
    var r = rand.uniformInt( 0, 99);
    if (r < 25) return 1;         // probability 0.25
    else if (r < 85) return 2;    // probability 0.60
    else return 3;                // probability 0.15
  }
}
Delivery.labels = {"quantity":"quant"};
