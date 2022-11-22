class SingleProductCompany extends oBJECT {
  constructor({ id, name, productType, liquidity, fixedCostPerDay }) {
    super( id, name);
    if (typeof productType === "object") this.productType = productType;
    else if (typeof productType === "string") {
      const o = sim.namedObjects.get(productType);
      this.productType = o ? o : productType;
    } else if (Number.isInteger( productType)) {
      const o = sim.objects.get( productType);
      this.productType = o ? o : productType;
    }
    this.liquidity = liquidity;
    this.fixedCostPerDay = fixedCostPerDay;  // Includes labor cost and facilities cost
    //*** history data ***
    this.dailyDemandQuantity = new RingBuffer();
  }
  getDemandForecast() {
    var demandForecast=0;
    const demandHistory = this.dailyDemandQuantity;
    if (demandHistory.nmrOfItems() === 0) {  // buffer still empty
      demandForecast = DailyDemand.quantity();
    } else  {  // Simple Exponential Smoothing (SES) with simple moving average
      demandForecast = Math.ceil( demandHistory.getMovingAverage( 3));
    }
    return demandForecast;
  }
  computeProductBatchCost() {  // "bom" maps input item IDs/names to quantities
    const bom = this.productType.bomItems;
    var cost=0;
    for (const inpItemName of Object.keys( bom)) {
      const inpItem = sim.namedObjects.get( inpItemName);
      cost += Math.ceil( bom[inpItemName] / inpItem.quantityPerSupplyUnit) * inpItem.purchasePrice;
    }
    return cost;
  }
  /******************************************************************
   Plan production quantity in number of batches (e.g. pitchers).
   First compute the production quantity based on demand forecast. Then check,
   if the liquidity is sufficient for purchasing the required materials.
   Otherwise, compute the production quantity based on available liquidity.
   ******************************************************************/
  planProdQtyAndReplenOrder( demandForecast) {
    function computeReplenishmentOrder( prodType, planProdQty) {
      const bom = prodType.bomItems,
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
    // in number of batches (e.g. pitchers in the case of lemonade)
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
    return {planProdQty, replenOrder};
  }
  performProduction( planProdQty) {
    const prodType = this.productType,
          bom = prodType.bomItems;
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
SingleProductCompany.displayAttributes = ["id","name","liquidity","fixedCostPerDay"];
SingleProductCompany.editableAttributes = ["liquidity","fixedCostPerDay"];
