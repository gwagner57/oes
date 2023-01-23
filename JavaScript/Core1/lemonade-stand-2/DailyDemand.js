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
          availSupplyUnits = Math.floor( prodType.stockQuantity / qtyPerSupplyUnit),
          //TODO: generalize this example-specific code
          availPackaging = Math.ceil(sim.namedObjects.get("PaperCup").stockQuantity /
              prodType.packagingItemsPerSupplyUnit["PaperCup"]),
          sellableSupplyUnits = Math.min( availSupplyUnits, availPackaging);
    // store dailyDemandQuantity in history buffer
    prodType.productCategory.market.dailyDemandQuantity.add( this.quantity);
    // deduct demand from product quantity and packaging materials in stock
    if (this.quantity > sellableSupplyUnits) {
      prodType.stockQuantity -= sellableSupplyUnits * qtyPerSupplyUnit;
      //TODO: generalize this example-specific code
      sim.namedObjects.get("PaperCup").stockQuantity -= sellableSupplyUnits;
      sim.stat.lostSales += this.quantity - sellableSupplyUnits;
    } else {
      prodType.stockQuantity -= this.quantity * qtyPerSupplyUnit;
      //TODO: generalize this example-specific code
      sim.namedObjects.get("PaperCup").stockQuantity -= this.quantity;
    }
    // calculate daily revenue
    const dailyRevenue = Math.min( this.quantity, sellableSupplyUnits) * prodType.salesPrice;
    // update statistics
    sim.stat.dailyRevenue = dailyRevenue;
    sim.stat.totalRevenue += dailyRevenue;
    // for visualization
    this.company.dailyProfit = sim.stat.dailyRevenue - this.company.fixedCostPerDay;
    return followupEvents;
  }
}
DailyDemand.quantity = function () {
  // in product quantity units (e.g., lemonade cups)
  return rand.uniformInt(150, 300);  //
};
DailyDemand.labels = {"className":"Dem", "quantity":"qty"};
