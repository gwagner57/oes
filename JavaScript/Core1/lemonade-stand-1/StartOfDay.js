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
    // forecast today's demand
    const dailyDemandForecast = this.company.getDemandForecast();
    // plan today's production and create replenishment order
    const replOrder = this.company.planProductionQuantityAndReplenishmentOrder( dailyDemandForecast);
    // schedule delivery of entire replenishment order
    followupEvents.push( new DailyDelivery({
      delay: 2,  // 2 hours later
      receiver: this.company,
      deliveredItems: replOrder
    }));
    followupEvents.push( new EndOfDay({
      delay: 10,  // 10 hours later
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
