class StartOfDay extends eVENT {
  constructor({occTime, delay, company} = {}) {
    super({occTime, delay});
    if (company === undefined) throw "No value for company provided in StartOfDay constructor";
    if (typeof company === "object") this.company =  company;
    else {
      if (!Number.isInteger( company)) throw "Value for company in StartOfDay constructor must be an object or integer";
      this.company = sim.objects.get( company);
    }
  }
  onEvent() {
    const followupEvents=[];
    // reset daily statistics
    sim.stat.dailyCosts = 0;
    sim.stat.dailyRevenue = 0;
    sim.stat.dailyProfit = 0;
    // forecast today's demand
    const dailyDemandForecast = this.company.getDemandForecast();
    // compute today's production quantity and replenishment order
    const {planProdQty, replenOrder} = this.company.planProdQtyAndReplenOrder( dailyDemandForecast);
    // schedule delivery of entire replenishment order
    followupEvents.push( new DailyDelivery({
      delay: 2,  // 2 hours later (at 10 am)
      receiver: this.company,
      deliveredItems: replenOrder
    }));
    followupEvents.push( new DailyProduction({
      delay: 3,  // 3 hours later (at 11 am)
      company: this.company,
      quantity: planProdQty
    }));
    followupEvents.push( new DailyDemand({
      delay: 9,  // 9 hours later (at 5 pm)
      company: this.company
    }));
    followupEvents.push( new EndOfDay({
      delay: 10,  // 10 hours later (at 6 pm)
      company: this.company
    }));
    return followupEvents;
  }
  createNextEvent() {
    return new StartOfDay({
      delay: StartOfDay.recurrence(),
      company: this.company
    });
  }}
// Any exogenous event type needs to define a static function "recurrence"
StartOfDay.recurrence = function () {
  return 24;
};
