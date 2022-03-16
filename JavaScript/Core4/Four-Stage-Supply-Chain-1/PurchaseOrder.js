class PurchaseOrder extends mESSAGEeVENT {
  constructor({ occTime, delay, quantity, sender, receiver}) {
    super({occTime, delay, sender, receiver});
    this.message = {type:"Order", quantity};
  }
  onEvent() {
    this.receiver.onReceive( this.message, this.sender);
    return [];  // no follow-up events
  }
}
PurchaseOrder.labels = {"className":"Order", "receiver":"to", "quantity":"qty"};

