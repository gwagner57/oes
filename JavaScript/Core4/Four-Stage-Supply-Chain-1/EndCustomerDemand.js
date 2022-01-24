class EndCustomerDemand extends eVENT {
  constructor({occTime, delay}={}) {
    super({occTime, delay});
    this.quantity = EndCustomerDemand.quantity();
    this.retailer = sim.objects.get(1);
  }
  onEvent() {
    this.retailer.onReceiveOrder( this.quantity);
    return [];
  }
  static quantity() {
    return rand.uniformInt( 3, 7);
  }
  static recurrence() {
    return 7;  // each week
  }
}
EndCustomerDemand.labels = {"className":"CustDem", "quantity":"qty"};

