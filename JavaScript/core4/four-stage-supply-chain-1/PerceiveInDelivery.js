/**
 * Inherits the general onEvent method from pERCEPTIONeVENT
 */
class PerceiveInDelivery extends pERCEPTIONeVENT {
  constructor({ occTime, delay, perceiver, quantity}) {
    super({occTime, delay, perceiver});
    this.quantity = quantity;
  }
}
PerceiveInDelivery.labels = {"className":"Delivery", "quantity":"qty", "perceiver":"at"};

