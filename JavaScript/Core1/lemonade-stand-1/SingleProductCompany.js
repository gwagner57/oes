class SingleProductCompany extends oBJECT {
  constructor({ id, name, productType, liquidity, fixedCostPerDay }) {
    super( id, name);
    this.productType = typeof productType === "object" ? productType :
        typeof productType === "string" ? sim.namedObjects.get( productType) :
            sim.objects.get( productType);
    this.liquidity = liquidity;
    this.fixedCostPerDay = fixedCostPerDay;  // Includes labor cost and facilities cost
    //*** statistics variables ***
    this.dailyDemandQuantity = new RingBuffer();
    this.dailyRevenue = new RingBuffer();
    this.dailyCosts = 0;
    this.dailyProfit = new RingBuffer();
  }
  getDemandForecast() {
    var sum=0, demandForecast=0;
    const demandHistory = this.dailyDemandQuantity,  // a ring buffer
          N = demandHistory.nmrOfItems();
    if (N < 3) {  // buffer still too empty
      demandForecast = DailyDemand.quantity();
    } else  {  // Simple Exponential Smoothing (SES) with simple moving average
      demandForecast = Math.ceil( demandHistory.getMovingAverage());
    }
    return demandForecast;
  }
  computeProductBatchCost() {  // "bom" maps input item IDs/names to quantities
    const bom = this.productType.bomItemsPerBatch;
    var cost=0;
    for (const inpItemName of Object.keys( bom)) {
      const inpItem = sim.namedObjects.get( inpItemName);
      cost += Math.ceil( bom[inpItemName] / inpItem.quantityPerSupplyUnit) * inpItem.purchasePrice;
    }
    return cost;
  }
  /**
   Plan production quantity in number of batches (e.g. pitchers)
   */
  planProductionQuantityAndReplenishmentOrder( demandForecast) {
    function computeReplenishmentOrder( prodType, planProdQty) {
      const bom = prodType.bomItemsPerBatch,
            packBom = prodType.packagingItemsPerSupplyUnit;
      var replenOrder={}, replenCost=0;
      // compute order quantities for production input replenishment
      for (const itemName of Object.keys( bom)) {
        const item = sim.namedObjects.get( itemName),
            requiredQty = planProdQty * bom[itemName],
            orderQty = Math.max( requiredQty - item.stockQuantity, 0);
        // order quantities in supply units
        replenOrder[itemName] = Math.ceil( orderQty / item.quantityPerSupplyUnit);
        replenCost += replenOrder[itemName] * item.purchasePrice;
      }
      // compute order quantities for packaging materials replenishment
      for (const itemName of Object.keys( packBom)) {
        const item = sim.namedObjects.get( itemName),
            requiredQty = (planProdQty * prodType.batchSize) / prodType.quantityPerSupplyUnit * packBom[itemName],
            orderQty = Math.max( requiredQty - item.stockQuantity, 0);
        // order quantities in supply units
        replenOrder[itemName] = Math.ceil( orderQty / item.quantityPerSupplyUnit);
        replenCost += replenOrder[itemName] * item.purchasePrice;
      }
      replenOrder.cost = replenCost;
      return replenOrder;
    }
    // in number of batches (e.g. pitchers)
    let planProdQty = Math.ceil( demandForecast * this.productType.quantityPerSupplyUnit /
            this.productType.batchSize);
    // compute replenishment order quantities and cost
    let replenOrder = computeReplenishmentOrder( this.productType, planProdQty);
    // decrease planProdQty if required by budget constraints
    if (replenOrder.cost > this.liquidity) {
      const batchCost = this.computeProductBatchCost();
      planProdQty = Math.floor( this.liquidity / batchCost);
      replenOrder = computeReplenishmentOrder( this.productType, planProdQty);
    }
    this.productType.plannedProductionQuantity = planProdQty;
    return replenOrder;
  }
  performProduction() {
    const prodType = this.productType,
          bom = prodType.bomItemsPerBatch,
          planProdQty = prodType.plannedProductionQuantity;
    // subtract production inputs from inventory
    for (const itemName of Object.keys( bom)) {
      const item = sim.namedObjects.get( itemName);
      item.stockQuantity -= bom[itemName] * planProdQty;
    }
    // put production output to inventory
    prodType.stockQuantity = planProdQty * prodType.batchSize;
  }
}
SingleProductCompany.labels = {"className":"SPC", "liquidity":"liq"};
