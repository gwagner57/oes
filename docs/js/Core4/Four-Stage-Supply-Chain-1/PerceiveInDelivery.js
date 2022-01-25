class PerceiveInDelivery extends pERCEPTIONeVENT {
  constructor({ occTime, delay, perceiver, quantity}) {
    super({occTime, delay, perceiver});
    this.quantity = quantity;
  }
  onEvent() {
    const percept = {type:"InDelivery", quantity: this.quantity};
    this.perceiver.onPerceive( percept);
    return [];  // no follow-up events
  }
}
PerceiveInDelivery.labels = {"className":"Delivery", "quantity":"qty", "perceiver":"at"};

