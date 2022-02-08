class TakeOrder extends aCTIVITY {
  constructor({id, startTime, duration, node}={}) {
    super({id, startTime, duration, node});
  }
  static duration() {
    return rand.uniform( 1, 4);
  }
}
TakeOrder.resourceRoles = {
  "orderTaker": {range: OrderTaker}
}
TakeOrder.PERFORMER = ["orderTaker"];
TakeOrder.successorNode = "MakePizza";
