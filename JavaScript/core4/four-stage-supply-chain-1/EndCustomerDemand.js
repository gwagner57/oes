class EndCustomerDemand extends eVENT {
  constructor({occTime, delay}={}) {
    super({occTime, delay});
    this.retailer = sim.objects.get(1);
  }
  onEvent() {
    const followupEvents=[];
    followupEvents.push( new mESSAGEeVENT({ receiver: this.retailer, sender:0, // dummy sender
        message:{ type:"PurchaseOrder", quantity: EndCustomerDemand.quantity()}}));
    return followupEvents;
  }
  static quantity() {
    return rand.uniformInt( 3, 7);
  }
  static recurrence() {
    return 7;  // each week
  }
}
EndCustomerDemand.labels = {"className":"CustDem", "quantity":"qty"};

