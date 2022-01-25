class ShipItems extends aCTION {
  constructor({ occTime, delay, performer, quantity}) {
    super({occTime, delay, performer});
    this.quantity = quantity;
    // for the simulation log
    this.receiverId = this.performer.downStreamNode?.id || 0;  // 0 = end customer
  }
  onEvent() {
    const followupEvents=[];
    if (this.performer.downStreamNode) {
      followupEvents.push( new PerceiveInDelivery({delay: 7, quantity: this.quantity,
          perceiver: this.performer.downStreamNode}));
    }
    return followupEvents;
  }
}
ShipItems.labels = {"className":"Ship", "quantity":"qty","receiverId":"to"};

