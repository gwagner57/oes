class DailyDemand extends eVENT {
  constructor({occTime, delay, company, quantity}={}) {
    super({occTime, delay});
    this.company = company;
    if (quantity) this.quantity = quantity;
    else this.quantity = DailyDemand.quantity();  // random variable
  }
  onEvent() {
    const followupEvents=[],
          prodType = this.company.productType,
          qtyPerSupplyUnit = prodType.quantityPerSupplyUnit,
          availSupplyUnits = Math.floor( prodType.stockQuantity / qtyPerSupplyUnit);
    // store dailyDemandQuantity in history buffer
    this.company.dailyDemandQuantity.add( this.quantity);
    // deduct demand from quantity in stock
    if (this.quantity > availSupplyUnits) {
      prodType.stockQuantity = 0;
      sim.stat.lostSales += this.quantity - availSupplyUnits;
    } else {
      prodType.stockQuantity -= this.quantity * qtyPerSupplyUnit;
    }
    // calculate daily revenue
    const dailyRevenue = Math.min( this.quantity, availSupplyUnits) * prodType.salesPrice;
    this.company.dailyRevenue.add( dailyRevenue);
    // update liquidity
    this.company.liquidity += dailyRevenue;
    // update statistics
    sim.stat.totalRevenue += dailyRevenue;
    return followupEvents;
  }
}
DailyDemand.quantity = function () {
  // in product quantity units (e.g., lemonade cups)
  return rand.uniformInt(50, 100);  //
};