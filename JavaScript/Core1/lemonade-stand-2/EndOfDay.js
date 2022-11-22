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
    sim.namedObjects.get("IceCubes").stockQuantity = 0;
    // update liquidity
    this.company.liquidity -= comp.fixedCostPerDay;
    // update statistics
    sim.stat.dailyCosts += comp.fixedCostPerDay;
    sim.stat.totalCosts += sim.stat.dailyCosts;
    sim.stat.dailyProfit = sim.stat.dailyRevenue - sim.stat.dailyCosts;
    return followupEvents;
  }
}
