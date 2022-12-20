class EndCustomerDemand extends eVENT {
  constructor({occTime, delay}={}) {
    super({occTime, delay});
    this.retailer = sim.objects.get(1);
    this.message = {type:"Order", quantity: EndCustomerDemand.quantity()};
  }
  onEvent() {
    this.retailer.onReceive( this.message);
    return [];  // no follow-up events
  }
  static quantity() {
    return rand.uniformInt( 3, 7);
  }
  static recurrence() {
    return 7;  // each week
  }
}
EndCustomerDemand.labels = {"className":"CustDem", "quantity":"qty"};

