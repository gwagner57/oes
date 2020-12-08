class TakeOrder extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {
    return 2.5; //rand.uniform( 1, 4);
  }
  static waitingTimeout() {
    return 4.5; //rand.uniformInt( 3, 6);
  }
}
TakeOrder.resourceRoles = {
  "orderTaker": {range: OrderTaker}
}
TakeOrder.PERFORMER = ["orderTaker"];
TakeOrder.successorActivity = "MakePizza";
