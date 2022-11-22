class DailyProduction extends eVENT {
  constructor({occTime, delay, company, quantity} = {}) {
    super({occTime, delay});
    this.company = company;
    this.quantity = quantity;
  }
  onEvent() {
    const followupEvents=[];
    this.company.performProduction( this.quantity);
    return followupEvents;
  }
}
DailyProduction.labels = {"className":"Prod", "quantity":"qty"};
