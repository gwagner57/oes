class EndOfDay extends eVENT {
  constructor({occTime, delay, company} = {}) {
    super({occTime, delay});
    this.company = company;
  }
  onEvent() {
    const followupEvents=[],
          comp = this.company;
    // dump remaining lemonade
    comp.productType.stockQuantity = 0;
    // dump expired input items
    comp.inputInventoryItemTypes["IceCubes"] = 0;
    // add fixed costs to already incurred replenishment costs
    comp.dailyCosts += comp.fixedCostPerDay;
    comp.dailyProfit.add( comp.dailyRevenue.getLast() - comp.dailyCosts);
    // update statistics
    sim.stat.totalCosts += comp.dailyCosts;
    return followupEvents;
  }
}
