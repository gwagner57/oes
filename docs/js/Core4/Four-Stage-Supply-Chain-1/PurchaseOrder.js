class PurchaseOrder extends mESSAGEeVENT {
  constructor({ occTime, delay, quantity, sender, receiver}) {
    super({occTime, delay, sender, receiver});
    this.quantity = quantity;
  }
  onEvent() {
    this.receiver.onReceiveOrder( this.quantity);
    return [];  // no follow-up events
  }
}
PurchaseOrder.labels = {"className":"Order", "receiver":"to", "quantity":"qty"};

