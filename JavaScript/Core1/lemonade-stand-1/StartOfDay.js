class StartOfDay extends eVENT {
  constructor({occTime, delay, company} = {}) {
    super({occTime, delay});
    this.company = typeof company === "object" ?
        company : sim.objects.get( company);
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
