class TakeOrder extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {
    return rand.uniform( 1, 4);
  }
  static waitingTimeout() {
    return rand.uniformInt( 3, 6);
  }
  onWaitingTimeout() {
    var followupEvents=[];
    // schedule a LostOrder event
    followupEvents.push( new LostOrder());
    return followupEvents;
  }
}
TakeOrder.resourceRoles = {
  "orderTaker": {range: OrderTaker}
}
TakeOrder.PERFORMER = ["orderTaker"];
TakeOrder.successorActivity = "MakePizza";
